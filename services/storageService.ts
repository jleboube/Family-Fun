import { User, GameScore, GameType } from '../types';

const USERS_KEY = 'family_game_users';
const SCORES_KEY = 'family_game_scores';
const SESSION_KEY = 'family_game_session';

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

// Generates an avatar with specific skin tones (pale, light) as requested
const generateAvatar = (seed: string) => {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&skinColor=pale,light`;
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
    coins: 50, // Start with 50 coins as a welcome bonus
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
    localStorage.setItem(SESSION_KEY, JSON.stringify(existingByGoogleId));
    return existingByGoogleId;
  }

  const existingByEmail = users.find(u => u.email === email);
  if (existingByEmail) {
    // Link Google account to existing user
    existingByEmail.googleId = googleId;
    if (picture) existingByEmail.avatar = picture;
    saveUser(existingByEmail);
    localStorage.setItem(SESSION_KEY, JSON.stringify(existingByEmail));
    return existingByEmail;
  }

  const newUser: User = {
    id: crypto.randomUUID(),
    username: name || email.split('@')[0],
    avatar: picture || generateAvatar(email),
    role: 'user',
    coins: 50,
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
}