import React, { useState } from 'react';
import { User } from '../types';
import { saveUser } from '../services/storageService';
import { X, RefreshCw } from 'lucide-react';

interface ProfileModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (user: User) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ user, isOpen, onClose, onUpdate }) => {
  const [username, setUsername] = useState(user.username);
  const [seed, setSeed] = useState(user.username); // Use username as initial seed

  if (!isOpen) return null;

  const currentAvatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&skinColor=pale,light`;

  const handleSave = () => {
    const updatedUser = { ...user, username, avatar: currentAvatarUrl };
    saveUser(updatedUser);
    onUpdate(updatedUser);
    onClose();
  };

  const randomizeLook = () => {
    setSeed(Math.random().toString(36).substring(7));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col items-center mb-6">
          <div className="relative group">
            <img 
              src={currentAvatarUrl} 
              alt="avatar" 
              className="w-32 h-32 rounded-full bg-gray-100 border-4 border-white shadow-md" 
            />
            <button 
              onClick={randomizeLook}
              className="absolute bottom-0 right-0 p-2 bg-secondary text-white rounded-full shadow-lg hover:bg-pink-600 transition-colors"
              title="Randomize Look"
            >
              <RefreshCw size={16} />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">White/Light skin tones locked by default</p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary outline-none"
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-primary hover:bg-indigo-600 text-white font-bold py-3 rounded-xl transition-colors"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default ProfileModal;