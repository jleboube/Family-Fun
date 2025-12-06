import { User, GameScore, GameType, Group } from '../types';

const USERS_KEY = 'family_game_users';
const SCORES_KEY = 'family_game_scores';
const SESSION_KEY = 'family_game_session';
const GROUPS_KEY = 'family_game_groups';

// Admin email from environment (baked in at build time)
// @ts-ignore - Vite replaces process.env.ADMIN_EMAIL at build time
const ADMIN_EMAIL: string = process.env.ADMIN_EMAIL || '';

// Check if an email should be granted admin privileges
export const isAdminEmail = (email: string): boolean => {
  if (!ADMIN_EMAIL || !email) return false;
  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
};

export const getUsers = (): User[] => {
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveUser = (user: User): void => {
  const users = getUsers();
  // Update if exists, else push
  const idx = users.findIndex(u => u.id === user.id);
  if (idx >= 0) {
    users[idx] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  
  // Update session if it's the current user
  const current = getCurrentUser();
  if (current && current.id === user.id) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  }
};

export const loginUser = (username: string): User | null => {
  const users = getUsers();
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  }
  return null;
};

// Generates an avatar using DiceBear API
const generateAvatar = (seed: string) => {
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
};

export const registerUser = (username: string, isAdmin: boolean = false): User => {
  const users = getUsers();
  const existing = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (existing) return existing;

  const newUser: User = {
    id: crypto.randomUUID(),
    username,
    avatar: generateAvatar(username),
    role: isAdmin ? 'admin' : 'user',
    coins: 0, // Start with 0 coins - earn them by playing!
    createdAt: Date.now(),
  };
  saveUser(newUser);
  localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
  return newUser;
};

export const registerGoogleUser = (googleId: string, email: string, name: string, picture?: string): User => {
  const users = getUsers();

  // Check if user already exists by googleId or email
  const existingByGoogleId = users.find(u => u.googleId === googleId);
  if (existingByGoogleId) {
    // Update to admin if email matches admin email and they're not already admin
    if (isAdminEmail(email) && existingByGoogleId.role !== 'admin') {
      existingByGoogleId.role = 'admin';
      saveUser(existingByGoogleId);
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(existingByGoogleId));
    return existingByGoogleId;
  }

  const existingByEmail = users.find(u => u.email === email);
  if (existingByEmail) {
    // Link Google account to existing user
    existingByEmail.googleId = googleId;
    if (picture) existingByEmail.avatar = picture;
    // Update to admin if email matches admin email
    if (isAdminEmail(email)) existingByEmail.role = 'admin';
    saveUser(existingByEmail);
    localStorage.setItem(SESSION_KEY, JSON.stringify(existingByEmail));
    return existingByEmail;
  }

  const newUser: User = {
    id: crypto.randomUUID(),
    username: name || email.split('@')[0],
    avatar: picture || generateAvatar(email),
    role: isAdminEmail(email) ? 'admin' : 'user', // Auto-admin if email matches
    coins: 0, // Start with 0 coins - earn them by playing!
    createdAt: Date.now(),
    email,
    googleId,
  };
  saveUser(newUser);
  localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
  return newUser;
};

export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem(SESSION_KEY);
  return data ? JSON.parse(data) : null;
};

export const logoutUser = (): void => {
  localStorage.removeItem(SESSION_KEY);
};

export const getScores = (): GameScore[] => {
  const data = localStorage.getItem(SCORES_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveScore = (score: GameScore): void => {
  const scores = getScores();
  // If this is a retry (same day, same game), we might want to replace the old score
  // But for history tracking, we append. The leaderboard logic takes the aggregate.
  scores.push(score);
  localStorage.setItem(SCORES_KEY, JSON.stringify(scores));
};

export const deleteDailyScore = (userId: string, gameType: GameType) => {
  let scores = getScores();
  const startOfDay = new Date().setHours(0,0,0,0);
  // Remove scores for this game type today to allow a retry
  scores = scores.filter(s => !(s.userId === userId && s.gameType === gameType && s.timestamp >= startOfDay));
  localStorage.setItem(SCORES_KEY, JSON.stringify(scores));
};

export const deductCoins = (userId: string, amount: number): boolean => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) return false;

  if (users[userIndex].coins >= amount) {
    users[userIndex].coins -= amount;
    saveUser(users[userIndex]);
    return true;
  }
  return false;
};

export const addCoins = (userId: string, amount: number): void => {
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  if (user) {
    user.coins += amount;
    saveUser(user);
  }
};

export const calculateStreak = (userId: string): number => {
  const scores = getScores().filter(s => s.userId === userId);
  if (scores.length === 0) return 0;

  // Get unique days played
  const daysPlayed = new Set(scores.map(s => new Date(s.timestamp).setHours(0,0,0,0)));
  const sortedDays = Array.from(daysPlayed).sort((a, b) => b - a); // Descending

  if (sortedDays.length === 0) return 0;

  let streak = 0;
  let currentCheck = new Date().setHours(0,0,0,0);
  
  // If they haven't played today, check if they played yesterday to keep streak alive
  if (!daysPlayed.has(currentCheck)) {
    // If last played was not yesterday, streak is broken (unless we are generous and say current streak is 0)
    // Let's check yesterday
    const yesterday = currentCheck - 86400000;
    if (!daysPlayed.has(yesterday)) return 0;
    currentCheck = yesterday;
  }

  // Count backwards
  while (daysPlayed.has(currentCheck)) {
    streak++;
    currentCheck -= 86400000;
  }
  
  return streak;
};

export const getLeaderboard = () => {
  const scores = getScores();
  const users = getUsers();
  
  const leaderboard: Record<string, { user: User, totalScore: number, gamesPlayed: number, cheaterCount: number, streak: number }> = {};
  
  users.forEach(u => {
    leaderboard[u.id] = { user: u, totalScore: 0, gamesPlayed: 0, cheaterCount: 0, streak: calculateStreak(u.id) };
  });

  scores.forEach(s => {
    if (leaderboard[s.userId]) {
      leaderboard[s.userId].totalScore += s.score;
      leaderboard[s.userId].gamesPlayed += 1;
      if (s.cheated) leaderboard[s.userId].cheaterCount += 1;
    }
  });

  return Object.values(leaderboard).sort((a, b) => b.totalScore - a.totalScore);
};

export const clearAllData = () => {
    localStorage.removeItem(USERS_KEY);
    localStorage.removeItem(SCORES_KEY);
    localStorage.removeItem(SESSION_KEY);
};

// ==================== GROUP/FAMILY MANAGEMENT ====================

// Generate a unique 6-character invite code
const generateInviteCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing chars (0, O, 1, I)
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  // Ensure uniqueness
  const groups = getGroups();
  if (groups.some(g => g.inviteCode === code)) {
    return generateInviteCode(); // Recursively generate new code if collision
  }
  return code;
};

export const getGroups = (): Group[] => {
  const data = localStorage.getItem(GROUPS_KEY);
  return data ? JSON.parse(data) : [];
};

export const getGroupById = (groupId: string): Group | null => {
  const groups = getGroups();
  return groups.find(g => g.id === groupId) || null;
};

export const getGroupByInviteCode = (inviteCode: string): Group | null => {
  const groups = getGroups();
  return groups.find(g => g.inviteCode.toUpperCase() === inviteCode.toUpperCase()) || null;
};

export const createGroup = (name: string, creatorId: string): Group => {
  const groups = getGroups();

  const newGroup: Group = {
    id: crypto.randomUUID(),
    name,
    inviteCode: generateInviteCode(),
    createdBy: creatorId,
    createdAt: Date.now(),
    memberIds: [creatorId],
  };

  groups.push(newGroup);
  localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));

  // Update the creator's groupId
  const users = getUsers();
  const creator = users.find(u => u.id === creatorId);
  if (creator) {
    creator.groupId = newGroup.id;
    saveUser(creator);
  }

  return newGroup;
};

export const joinGroup = (userId: string, inviteCode: string): { success: boolean; group?: Group; error?: string } => {
  const group = getGroupByInviteCode(inviteCode);
  if (!group) {
    return { success: false, error: 'Invalid invite code' };
  }

  // Check if user is already in this group
  if (group.memberIds.includes(userId)) {
    return { success: false, error: 'You are already a member of this group' };
  }

  // Check if user is already in another group
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  if (user?.groupId) {
    return { success: false, error: 'You are already in a group. Leave your current group first.' };
  }

  // Add user to group
  const groups = getGroups();
  const groupIndex = groups.findIndex(g => g.id === group.id);
  if (groupIndex >= 0) {
    groups[groupIndex].memberIds.push(userId);
    localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
  }

  // Update user's groupId
  if (user) {
    user.groupId = group.id;
    saveUser(user);
  }

  return { success: true, group };
};

export const leaveGroup = (userId: string): { success: boolean; error?: string } => {
  const users = getUsers();
  const user = users.find(u => u.id === userId);

  if (!user?.groupId) {
    return { success: false, error: 'You are not in a group' };
  }

  const groups = getGroups();
  const groupIndex = groups.findIndex(g => g.id === user.groupId);

  if (groupIndex >= 0) {
    // Remove user from group
    groups[groupIndex].memberIds = groups[groupIndex].memberIds.filter(id => id !== userId);

    // If group is empty, delete it
    if (groups[groupIndex].memberIds.length === 0) {
      groups.splice(groupIndex, 1);
    }

    localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
  }

  // Clear user's groupId
  user.groupId = undefined;
  saveUser(user);

  return { success: true };
};

export const deleteGroup = (groupId: string): { success: boolean; error?: string } => {
  const groups = getGroups();
  const groupIndex = groups.findIndex(g => g.id === groupId);

  if (groupIndex < 0) {
    return { success: false, error: 'Group not found' };
  }

  const group = groups[groupIndex];

  // Remove groupId from all members
  const users = getUsers();
  group.memberIds.forEach(memberId => {
    const member = users.find(u => u.id === memberId);
    if (member) {
      member.groupId = undefined;
      saveUser(member);
    }
  });

  // Delete the group
  groups.splice(groupIndex, 1);
  localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));

  return { success: true };
};

export const updateGroupName = (groupId: string, newName: string): { success: boolean; error?: string } => {
  const groups = getGroups();
  const groupIndex = groups.findIndex(g => g.id === groupId);

  if (groupIndex < 0) {
    return { success: false, error: 'Group not found' };
  }

  groups[groupIndex].name = newName;
  localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));

  return { success: true };
};

export const regenerateInviteCode = (groupId: string): { success: boolean; newCode?: string; error?: string } => {
  const groups = getGroups();
  const groupIndex = groups.findIndex(g => g.id === groupId);

  if (groupIndex < 0) {
    return { success: false, error: 'Group not found' };
  }

  const newCode = generateInviteCode();
  groups[groupIndex].inviteCode = newCode;
  localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));

  return { success: true, newCode };
};

export const getGroupMembers = (groupId: string): User[] => {
  const group = getGroupById(groupId);
  if (!group) return [];

  const users = getUsers();
  return users.filter(u => group.memberIds.includes(u.id));
};

export const getGroupLeaderboard = (groupId: string) => {
  const members = getGroupMembers(groupId);
  const scores = getScores();

  return members.map(member => {
    const memberScores = scores.filter(s => s.userId === member.id);
    const totalScore = memberScores.reduce((sum, s) => sum + s.score, 0);
    const gamesPlayed = memberScores.length;
    const cheaterCount = memberScores.filter(s => s.cheated).length;

    return {
      user: member,
      totalScore,
      gamesPlayed,
      cheaterCount,
      streak: calculateStreak(member.id),
    };
  }).sort((a, b) => b.totalScore - a.totalScore);
};

// ==================== DATA MIGRATION ====================

// Migration: Reset all users' coins to match their actual earned scores
// This ensures existing users don't have fake starting coins
const MIGRATION_KEY = 'family_game_migration_v1';

export const migrateUserCoins = (): void => {
  // Only run migration once
  if (localStorage.getItem(MIGRATION_KEY)) return;

  const users = getUsers();
  const scores = getScores();

  users.forEach(user => {
    // Calculate total score earned by this user from game scores
    const userScores = scores.filter(s => s.userId === user.id);
    const earnedCoins = userScores.reduce((total, s) => total + s.score, 0);

    // Reset coins to earned amount (not fake starting balance)
    user.coins = earnedCoins;

    // Update in storage
    const allUsers = getUsers();
    const idx = allUsers.findIndex(u => u.id === user.id);
    if (idx >= 0) {
      allUsers[idx] = user;
      localStorage.setItem(USERS_KEY, JSON.stringify(allUsers));
    }
  });

  // Update current session if logged in
  const currentUser = getCurrentUser();
  if (currentUser) {
    const updatedUsers = getUsers();
    const updated = updatedUsers.find(u => u.id === currentUser.id);
    if (updated) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
    }
  }

  // Mark migration as complete
  localStorage.setItem(MIGRATION_KEY, 'true');
};