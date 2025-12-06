import React, { useState, useEffect, useRef } from 'react';
import { loginUser, registerUser, registerGoogleUser, getUsers, getGroups, joinGroup, createGroup, getGroupById } from '../services/storageService';
import { findSimilarNames, NameSuggestion } from '../services/geminiService';
import { User, Group } from '../types';
import { Gamepad2, AlertCircle, Users, Sparkles, Loader2, Check, X } from 'lucide-react';

// Declare google global for TypeScript
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleInitConfig) => void;
          renderButton: (element: HTMLElement, config: GoogleButtonConfig) => void;
          prompt: () => void;
        };
      };
    };
  }
}

interface GoogleInitConfig {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  auto_select?: boolean;
}

interface GoogleButtonConfig {
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  width?: number;
}

interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
}

interface DecodedJWT {
  sub: string; // Google user ID
  email: string;
  email_verified: boolean;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
}

// Decode JWT without library (for client-side use only)
const decodeJWT = (token: string): DecodedJWT | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [googleError, setGoogleError] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(true);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  // Group joining state
  const [showGroupOptions, setShowGroupOptions] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [groupError, setGroupError] = useState('');
  const [pendingUser, setPendingUser] = useState<User | null>(null);

  // AI suggestions state
  const [aiSuggestions, setAiSuggestions] = useState<NameSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  // @ts-ignore - Vite replaces process.env.GOOGLE_CLIENT_ID at build time
  const googleClientId: string = process.env.GOOGLE_CLIENT_ID || '';

  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogle;
    script.onerror = () => {
      setGoogleError('Failed to load Google Sign-In');
      setIsGoogleLoading(false);
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  const initializeGoogle = () => {
    if (!googleClientId) {
      setGoogleError('Google Sign-In not configured. Please set GOOGLE_CLIENT_ID.');
      setIsGoogleLoading(false);
      return;
    }

    if (window.google && googleButtonRef.current) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCallback,
        });

        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          width: 300,
        });

        setIsGoogleLoading(false);
      } catch (err) {
        setGoogleError('Failed to initialize Google Sign-In');
        setIsGoogleLoading(false);
      }
    }
  };

  const handleGoogleCallback = async (response: GoogleCredentialResponse) => {
    const decoded = decodeJWT(response.credential);
    if (decoded) {
      const user = registerGoogleUser(
        decoded.sub,
        decoded.email,
        decoded.name,
        decoded.picture
      );

      // If user doesn't have a group, show group options
      if (!user.groupId) {
        setPendingUser(user);
        setShowGroupOptions(true);
        await checkForSimilarNames(decoded.name);
      } else {
        onLogin(user);
      }
    } else {
      setGoogleError('Failed to process Google Sign-In');
    }
  };

  const checkForSimilarNames = async (userName: string) => {
    setIsLoadingSuggestions(true);
    try {
      const users = getUsers();
      const groups = getGroups();

      // Build user list with group info
      const usersWithGroups = users.map(u => {
        const group = u.groupId ? getGroupById(u.groupId) : null;
        return {
          id: u.id,
          username: u.username,
          groupId: u.groupId,
          groupName: group?.name
        };
      });

      const suggestions = await findSimilarNames(userName, usersWithGroups);
      setAiSuggestions(suggestions);
    } catch (err) {
      console.error('Failed to get AI suggestions:', err);
    }
    setIsLoadingSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setError('');

    if (isRegister) {
      const user = registerUser(username, false);
      setPendingUser(user);
      setShowGroupOptions(true);
      await checkForSimilarNames(username);
    } else {
      const user = loginUser(username);
      if (user) {
        onLogin(user);
      } else {
        setError('User not found. Check spelling or create a new account.');
      }
    }
  };

  const handleJoinGroup = () => {
    if (!pendingUser || !inviteCode.trim()) return;

    const result = joinGroup(pendingUser.id, inviteCode.trim().toUpperCase());
    if (result.success) {
      // Refresh user data
      const updatedUser = { ...pendingUser, groupId: result.group!.id };
      onLogin(updatedUser);
    } else {
      setGroupError(result.error || 'Failed to join group');
    }
  };

  const handleCreateGroup = () => {
    if (!pendingUser || !newGroupName.trim()) return;

    const group = createGroup(newGroupName.trim(), pendingUser.id);
    const updatedUser = { ...pendingUser, groupId: group.id };
    onLogin(updatedUser);
  };

  const handleJoinSuggestedGroup = (groupId: string) => {
    if (!pendingUser) return;

    const group = getGroupById(groupId);
    if (group) {
      const result = joinGroup(pendingUser.id, group.inviteCode);
      if (result.success) {
        const updatedUser = { ...pendingUser, groupId: group.id };
        onLogin(updatedUser);
      } else {
        setGroupError(result.error || 'Failed to join group');
      }
    }
  };

  const handleSkipGroup = () => {
    if (pendingUser) {
      onLogin(pendingUser);
    }
  };

  // Show group options screen
  if (showGroupOptions && pendingUser) {
    const suggestedGroups = aiSuggestions
      .filter(s => s.groupId)
      .reduce((acc, s) => {
        if (!acc.find(g => g.groupId === s.groupId)) {
          acc.push(s);
        }
        return acc;
      }, [] as NameSuggestion[]);

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md">
          <div className="flex justify-center mb-6">
            <div className="bg-indigo-100 p-4 rounded-full">
              <Users size={48} className="text-indigo-600" />
            </div>
          </div>

          <h2 className="text-2xl font-extrabold text-center text-gray-900 mb-2">
            Join a Family Group
          </h2>
          <p className="text-center text-gray-500 mb-6">
            Welcome, <span className="font-bold">{pendingUser.username}</span>! Join or create a group to compete with family.
          </p>

          {/* AI Suggestions */}
          {isLoadingSuggestions && (
            <div className="flex items-center justify-center p-4 mb-6 bg-indigo-50 rounded-xl">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-600 mr-2" />
              <span className="text-indigo-700 text-sm">Looking for family members...</span>
            </div>
          )}

          {!isLoadingSuggestions && suggestedGroups.length > 0 && (
            <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
              <div className="flex items-center mb-3">
                <Sparkles className="w-5 h-5 text-indigo-600 mr-2" />
                <span className="font-bold text-indigo-900">AI Found Possible Family!</span>
              </div>
              <div className="space-y-2">
                {suggestedGroups.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleJoinSuggestedGroup(suggestion.groupId!)}
                    className="w-full flex items-center justify-between p-3 bg-white rounded-lg hover:bg-indigo-50 transition-colors border border-indigo-100"
                  >
                    <div className="text-left">
                      <p className="font-bold text-gray-900">{suggestion.groupName}</p>
                      <p className="text-xs text-gray-500">{suggestion.reason}</p>
                    </div>
                    <Check className="w-5 h-5 text-indigo-600" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Join with Code */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Have an invite code?</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => { setInviteCode(e.target.value.toUpperCase()); setGroupError(''); }}
                placeholder="ABCD12"
                maxLength={6}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-mono text-lg tracking-widest uppercase"
              />
              <button
                onClick={handleJoinGroup}
                disabled={inviteCode.length !== 6}
                className="px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
              >
                Join
              </button>
            </div>
            {groupError && <p className="text-red-500 text-sm mt-2">{groupError}</p>}
          </div>

          {/* Create New Group */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Or create a new family group</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="The Smiths"
                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              />
              <button
                onClick={handleCreateGroup}
                disabled={!newGroupName.trim()}
                className="px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
              >
                Create
              </button>
            </div>
          </div>

          {/* Skip */}
          <button
            onClick={handleSkipGroup}
            className="w-full py-3 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
          >
            Skip for now - I'll join later
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-primary/10 p-4 rounded-full">
            <Gamepad2 size={48} className="text-primary" />
          </div>
        </div>

        <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-2">
          {isRegister ? 'Join the Family' : 'Welcome Back'}
        </h2>
        <p className="text-center text-gray-500 mb-8">
          {isRegister ? 'Create your player profile' : 'Login to defend your title'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username / Nickname</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              placeholder="e.g. GrandmaSlayer99"
              autoFocus
            />
          </div>

          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

          <button
            type="submit"
            className="w-full bg-primary hover:bg-orange-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
          >
            {isRegister ? "Let's Play!" : "Login"}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Google Sign-In Button */}
          <div className="flex flex-col items-center">
            {isGoogleLoading && !googleError && (
              <div className="w-full h-12 bg-gray-100 rounded-xl animate-pulse flex items-center justify-center">
                <span className="text-gray-400 text-sm">Loading Google Sign-In...</span>
              </div>
            )}

            {googleError && (
              <div className="w-full p-3 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center text-yellow-800 text-sm">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{googleError}</span>
              </div>
            )}

            <div
              ref={googleButtonRef}
              className={`${isGoogleLoading || googleError ? 'hidden' : ''} flex justify-center`}
            />
          </div>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            className="text-sm text-gray-600 hover:text-primary font-medium"
          >
            {isRegister ? 'Already have an account? Login' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
