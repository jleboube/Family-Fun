export enum GameType {
  TRIVIA = 'TRIVIA',
  WORD_WIZARD = 'WORD_WIZARD',
  LOGIC_LAB = 'LOGIC_LAB',
  EMOJI_ENIGMA = 'EMOJI_ENIGMA',
  MATH_MANIA = 'MATH_MANIA',
  BONUS_ROUND = 'BONUS_ROUND',
}

export interface User {
  id: string;
  username: string;
  avatar: string; // URL
  role: 'admin' | 'user';
  coins: number;
  createdAt: number;
  email?: string;
  googleId?: string;
}

export interface GameScore {
  id: string;
  userId: string;
  gameType: GameType;
  score: number;
  maxScore: number;
  timestamp: number;
  cheated: boolean;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string; // For trivia
  explanation?: string;
}

export interface WordChallenge {
  word: string;
  hint: string;
  definition: string;
}

export interface LogicPuzzle {
  question: string;
  answer: string;
  hint: string;
}

export interface EmojiChallenge {
  phrase: string;
  emojis: string;
  category: string;
  hint: string;
}

export interface MathProblem {
  question: string;
  answer: number;
  difficulty: 'easy' | 'medium' | 'hard';
}