import React, { useState, useEffect } from 'react';
import {
  getUsers,
  clearAllData,
  getGroups,
  createGroup,
  deleteGroup,
  updateGroupName,
  regenerateInviteCode,
  getGroupMembers,
  leaveGroup
} from '../services/storageService';
import { User, Group } from '../types';
import { Trash2, Users, Database, Plus, Copy, RefreshCw, Edit2, Check, X, UserMinus, UsersRound } from 'lucide-react';

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const refreshData = () => {
    setUsers(getUsers());
    setGroups(getGroups());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleReset = () => {
    if (window.confirm("ARE YOU SURE? This will delete ALL users, scores, groups, and history. This cannot be undone.")) {
      clearAllData();
      window.location.reload();
    }
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    // Create group with first admin user as creator (or a placeholder)
    const adminUser = users.find(u => u.role === 'admin');
    if (adminUser) {
      createGroup(newGroupName.trim(), adminUser.id);
      setNewGroupName('');
      refreshData();
    } else {
      alert('No admin user found to create group');
    }
  };

  const handleDeleteGroup = (groupId: string, groupName: string) => {
    if (window.confirm(`Delete the group "${groupName}"? All members will be removed from the group.`)) {
      deleteGroup(groupId);
      refreshData();
    }
  };

  const handleUpdateGroupName = (groupId: string) => {
    if (editingName.trim()) {
      updateGroupName(groupId, editingName.trim());
      setEditingGroupId(null);
      setEditingName('');
      refreshData();
    }
  };

  const handleRegenerateCode = (groupId: string) => {
    if (window.confirm('Generate a new invite code? The old code will no longer work.')) {
      regenerateInviteCode(groupId);
      refreshData();
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleRemoveMember = (userId: string, userName: string, groupName: string) => {
    if (window.confirm(`Remove ${userName} from ${groupName}?`)) {
      leaveGroup(userId);
      refreshData();
    }
  };

  const getUsersWithoutGroup = () => users.filter(u => !u.groupId);

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
        <h2 className="text-red-800 font-bold text-lg flex items-center">
          <ShieldIcon className="mr-2" /> Admin Zone
        </h2>
        <p className="text-red-700 text-sm mt-1">
          Manage groups, users, and system settings.
        </p>
      </div>

      {/* Groups Management */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center">
          <UsersRound className="mr-2 text-indigo-500" />
          Groups / Families ({groups.length})
        </h3>

        {/* Create New Group */}
        <form onSubmit={handleCreateGroup} className="flex gap-2 mb-6">
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="New group name..."
            className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={!newGroupName.trim()}
            className="px-4 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Plus size={18} />
            Create Group
          </button>
        </form>

        {/* Groups List */}
        <div className="space-y-4">
          {groups.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No groups created yet</p>
          ) : (
            groups.map(group => {
              const members = getGroupMembers(group.id);
              const isEditing = editingGroupId === group.id;

              return (
                <div key={group.id} className="border border-gray-100 rounded-xl p-4">
                  {/* Group Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="px-3 py-1 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500"
                            autoFocus
                          />
                          <button
                            onClick={() => handleUpdateGroupName(group.id)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={() => { setEditingGroupId(null); setEditingName(''); }}
                            className="p-1 text-gray-400 hover:bg-gray-50 rounded"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <h4 className="font-bold text-gray-800">{group.name}</h4>
                          <button
                            onClick={() => { setEditingGroupId(group.id); setEditingName(group.name); }}
                            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded"
                          >
                            <Edit2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteGroup(group.id, group.name)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {/* Invite Code */}
                  <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-500">Invite Code:</span>
                    <code className="font-mono font-bold text-indigo-600 text-lg tracking-wider">
                      {group.inviteCode}
                    </code>
                    <button
                      onClick={() => handleCopyCode(group.inviteCode)}
                      className={`p-1.5 rounded transition-colors ${
                        copiedCode === group.inviteCode
                          ? 'bg-green-100 text-green-600'
                          : 'hover:bg-gray-200 text-gray-500'
                      }`}
                    >
                      {copiedCode === group.inviteCode ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                    <button
                      onClick={() => handleRegenerateCode(group.id)}
                      className="p-1.5 hover:bg-gray-200 text-gray-500 rounded transition-colors"
                      title="Generate new code"
                    >
                      <RefreshCw size={16} />
                    </button>
                  </div>

                  {/* Members */}
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Members ({members.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {members.map(member => (
                        <div
                          key={member.id}
                          className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full"
                        >
                          <img src={member.avatar} className="w-6 h-6 rounded-full" alt={member.username} />
                          <span className="text-sm font-medium">{member.username}</span>
                          {member.role === 'admin' && (
                            <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">admin</span>
                          )}
                          <button
                            onClick={() => handleRemoveMember(member.id, member.username, group.name)}
                            className="p-0.5 text-gray-400 hover:text-red-500 transition-colors"
                            title="Remove from group"
                          >
                            <UserMinus size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* All Users */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center">
            <Users className="mr-2 text-blue-500" />
            All Users ({users.length})
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {users.map(u => {
              const userGroup = groups.find(g => g.id === u.groupId);
              return (
                <div key={u.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <img src={u.avatar} className="w-8 h-8 rounded-full" alt={u.username} />
                    <div>
                      <p className="font-medium text-sm">{u.username}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-400">{u.role}</p>
                        {userGroup && (
                          <span className="text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded">
                            {userGroup.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 font-mono">{u.id.slice(0, 4)}...</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Users Without Groups */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center">
            <Users className="mr-2 text-orange-500" />
            Ungrouped Users ({getUsersWithoutGroup().length})
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {getUsersWithoutGroup().length === 0 ? (
              <p className="text-gray-500 text-center py-4">All users are in groups</p>
            ) : (
              getUsersWithoutGroup().map(u => (
                <div key={u.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <img src={u.avatar} className="w-8 h-8 rounded-full" alt={u.username} />
                    <div>
                      <p className="font-medium text-sm">{u.username}</p>
                      <p className="text-xs text-gray-400">{u.email || 'No email'}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* System Maintenance */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center">
          <Database className="mr-2 text-purple-500" />
          System Maintenance
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          If things are buggy or you want to start a fresh tournament season, you can wipe the database here.
          This will delete ALL users, scores, and groups.
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
