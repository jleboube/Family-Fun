import React, { useState, useEffect, useRef } from 'react';
import { loginUser, registerUser, registerGoogleUser } from '../services/storageService';
import { User } from '../types';
import { Gamepad2, AlertCircle } from 'lucide-react';

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

  const handleGoogleCallback = (response: GoogleCredentialResponse) => {
    const decoded = decodeJWT(response.credential);
    if (decoded) {
      const user = registerGoogleUser(
        decoded.sub,
        decoded.email,
        decoded.name,
        decoded.picture
      );
      onLogin(user);
    } else {
      setGoogleError('Failed to process Google Sign-In');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setError('');

    if (isRegister) {
      const user = registerUser(username, false);
      onLogin(user);
    } else {
      const user = loginUser(username);
      if (user) {
        onLogin(user);
      } else {
        setError('User not found. Check spelling or create a new account.');
      }
    }
  };

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