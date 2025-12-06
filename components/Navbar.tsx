import React, { useState } from 'react';
import { User } from '../types';
import { LogOut, LayoutDashboard, Gamepad2, Shield, Coins } from 'lucide-react';
import ProfileModal from './ProfileModal';

interface NavbarProps {
  user: User;
  onLogout: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
  onUserUpdate: (user: User) => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, currentPage, onNavigate, onUserUpdate }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => onNavigate('hub')}>
              <div className="bg-primary/10 p-1.5 rounded-lg">
                <Gamepad2 className="h-6 w-6 text-primary" />
              </div>
              <span className="font-bold text-xl tracking-tight text-gray-900 hidden sm:block">FamilyFun</span>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Coin Balance */}
              <div className="flex items-center bg-yellow-100 text-yellow-800 px-3 py-1.5 rounded-full text-sm font-bold border border-yellow-200">
                <Coins size={16} className="mr-1 text-yellow-600" />
                {user.coins}
              </div>

              <div className="h-6 w-px bg-gray-300 mx-1 sm:mx-2" />

              <button 
                onClick={() => onNavigate('hub')}
                className={`p-2 rounded-lg transition-colors ${currentPage === 'hub' ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:text-gray-900'}`}
                title="Games"
              >
                <Gamepad2 size={24} />
              </button>
              
              <button 
                onClick={() => onNavigate('dashboard')}
                className={`p-2 rounded-lg transition-colors ${currentPage === 'dashboard' ? 'bg-secondary/10 text-secondary' : 'text-gray-500 hover:text-gray-900'}`}
                title="Leaderboard"
              >
                <LayoutDashboard size={24} />
              </button>

              {user.role === 'admin' && (
                <button 
                  onClick={() => onNavigate('admin')}
                  className={`p-2 rounded-lg transition-colors ${currentPage === 'admin' ? 'bg-accent/10 text-accent' : 'text-gray-500 hover:text-gray-900'}`}
                  title="Admin Panel"
                >
                  <Shield size={24} />
                </button>
              )}

              <div className="h-6 w-px bg-gray-300 mx-1 sm:mx-2" />
              
              <div className="flex items-center space-x-2">
                 <button onClick={() => setIsProfileOpen(true)} className="relative group transition-transform hover:scale-105">
                    <img src={user.avatar} alt="avatar" className="h-9 w-9 rounded-full bg-gray-100 border border-gray-200 shadow-sm" />
                 </button>
                 <button onClick={onLogout} className="text-gray-400 hover:text-red-500 p-2">
                   <LogOut size={20} />
                 </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <ProfileModal 
        user={user} 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
        onUpdate={onUserUpdate}
      />
    </>
  );
};

export default Navbar;