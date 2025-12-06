import React from 'react';
import { getUsers, clearAllData } from '../services/storageService';
import { Trash2, Users, Database } from 'lucide-react';

const AdminPanel: React.FC = () => {
  const users = getUsers();

  const handleReset = () => {
    if (window.confirm("ARE YOU SURE? This will delete ALL users, scores, and history. This cannot be undone.")) {
      clearAllData();
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
        <h2 className="text-red-800 font-bold text-lg flex items-center">
          <ShieldIcon className="mr-2" /> Admin Zone
        </h2>
        <p className="text-red-700 text-sm mt-1">
          With great power comes great responsibility. Be careful.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center">
            <Users className="mr-2 text-blue-500" />
            Family Members ({users.length})
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {users.map(u => (
              <div key={u.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <img src={u.avatar} className="w-8 h-8 rounded-full" />
                  <div>
                    <p className="font-medium text-sm">{u.username}</p>
                    <p className="text-xs text-gray-400">{u.role}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400 font-mono">{u.id.slice(0, 4)}...</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center">
            <Database className="mr-2 text-purple-500" />
            System Maintenance
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            If things are buggy or you want to start a fresh tournament season, you can wipe the database here.
          </p>
          <button 
            onClick={handleReset}
            className="w-full flex items-center justify-center space-x-2 bg-white border-2 border-red-500 text-red-500 hover:bg-red-50 font-bold py-3 rounded-xl transition-all"
          >
            <Trash2 size={20} />
            <span>Factory Reset App</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const ShieldIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={`w-6 h-6 ${className}`}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

export default AdminPanel;
