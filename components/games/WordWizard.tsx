import React, { useState, useEffect, useRef } from 'react';
import { generateWordChallenge } from '../../services/geminiService';
import { WordChallenge } from '../../types';
import { Loader2, Lightbulb, Zap } from 'lucide-react';
import { useGameTiming } from '../GameShell';

interface WordWizardProps {
  onEndGame: (score: number, maxScore: number) => void;
  isActive: boolean;
}

// Calculate time bonus for word guessing
// Base score depends on speed, with penalties for attempts and hints
const calculateTimeBonus = (secondsToAnswer: number): number => {
  if (secondsToAnswer <= 15) return 100;     // Lightning fast: full points
  if (secondsToAnswer <= 30) return 85;      // Very fast
  if (secondsToAnswer <= 45) return 70;      // Fast
  if (secondsToAnswer <= 60) return 55;      // Normal
  return 40;                                  // Slow but correct
};

const WordWizard: React.FC<WordWizardProps> = ({ onEndGame, isActive }) => {
  const [data, setData] = useState<WordChallenge | null>(null);
  const [guess, setGuess] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [gameWon, setGameWon] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [lastPoints, setLastPoints] = useState<number | null>(null);
  const puzzleStartTime = useRef<number>(Date.now());
  const { getElapsedTime } = useGameTiming();

  useEffect(() => {
    if (isActive && !data) {
      loadWord();
    }
  }, [isActive]);

  const loadWord = async () => {
    setLoading(true);
    const result = await generateWordChallenge();
    // Sanitize
    result.word = result.word.trim().toUpperCase();
    setData(result);
    setLoading(false);
    puzzleStartTime.current = Date.now();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data || gameWon) return;

    const userGuess = guess.trim().toUpperCase();
    setAttempts(p => p + 1);

    if (userGuess === data.word) {
      setGameWon(true);
      setMessage('CORRECT! You are a genius!');
      // Calculate time-based score with penalties
      const secondsToAnswer = (Date.now() - puzzleStartTime.current) / 1000;
      let calcScore = calculateTimeBonus(secondsToAnswer);
      // Apply attempt penalty (-10 per wrong attempt)
      calcScore = calcScore - (attempts * 10);
      // Apply hint penalty (-20 points)
      if (showHint) calcScore -= 20;
      // Minimum 10 points for a correct answer
      calcScore = Math.max(10, calcScore);
      setLastPoints(calcScore);
      setTimeout(() => onEndGame(calcScore, 100), 2000);
    } else {
      setMessage('Not quite. Try again!');
      setGuess('');
    }
  };

  if (loading) {
     return (
      <div className="h-96 flex flex-col items-center justify-center p-8">
        <Loader2 className="w-12 h-12 text-secondary animate-spin mb-4" />
        <p className="text-gray-500">Conjuring a magical word...</p>
      </div>
    );
  }

  if (!data) return <div className="p-8">Error loading word.</div>;

  return (
    <div className="p-6 h-full flex flex-col items-center text-center">
      <h3 className="text-2xl font-bold text-gray-900 mb-2">Word Wizard</h3>
      <p className="text-gray-500 mb-8">Guess the secret word from the definition.</p>

      <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl w-full mb-8 shadow-sm">
        <p className="text-lg font-medium text-amber-900 font-serif italic">"{data.definition}"</p>
      </div>

      <div className="flex gap-2 mb-8">
        {data.word.split('').map((_, i) => (
           <div key={i} className="w-10 h-12 border-b-4 border-gray-300 flex items-center justify-center text-2xl font-bold text-gray-400">
             {gameWon ? data.word[i] : (guess[i] || '')} 
             {/* Note: showing partial guess typing in boxes is tricky without complex input handling, simulating simplistically here or just using input below */}
           </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
        <input 
          type="text" 
          value={guess}
          onChange={(e) => setGuess(e.target.value.toUpperCase())}
          maxLength={data.word.length}
          placeholder="Type your guess..."
          className="w-full text-center text-3xl font-bold tracking-widest p-4 border-2 border-gray-200 rounded-xl focus:border-secondary focus:ring-4 focus:ring-secondary/20 outline-none uppercase transition-all"
          autoFocus
        />
        <button 
          type="submit" 
          disabled={guess.length === 0}
          className="w-full bg-secondary hover:bg-pink-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
        >
          CAST SPELL (GUESS)
        </button>
      </form>

      {message && <p className={`mt-4 font-bold ${gameWon ? 'text-green-600' : 'text-red-500'}`}>{message}</p>}

      {gameWon && lastPoints !== null && (
        <div className="mt-3 flex items-center justify-center p-3 bg-green-50 text-green-700 rounded-xl animate-in fade-in">
          <Zap className="w-5 h-5 mr-2" />
          <span className="font-bold">+{lastPoints} points!</span>
          {lastPoints >= 70 && <span className="ml-2 text-sm opacity-75">Speed bonus!</span>}
        </div>
      )}

      {!gameWon && !showHint && (
        <button 
          onClick={() => setShowHint(true)}
          className="mt-6 flex items-center text-sm text-gray-500 hover:text-amber-600 transition-colors"
        >
          <Lightbulb size={16} className="mr-1" /> Need a hint? (-20 pts)
        </button>
      )}

      {showHint && (
        <div className="mt-4 text-amber-600 font-medium animate-in fade-in">
          HINT: {data.hint}
        </div>
      )}
    </div>
  );
};

export default WordWizard;
