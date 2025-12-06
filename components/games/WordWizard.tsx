import React, { useState, useEffect } from 'react';
import { generateWordChallenge } from '../../services/geminiService';
import { WordChallenge } from '../../types';
import { Loader2, Lightbulb } from 'lucide-react';

interface WordWizardProps {
  onEndGame: (score: number, maxScore: number) => void;
  isActive: boolean;
}

const WordWizard: React.FC<WordWizardProps> = ({ onEndGame, isActive }) => {
  const [data, setData] = useState<WordChallenge | null>(null);
  const [guess, setGuess] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [gameWon, setGameWon] = useState(false);
  const [showHint, setShowHint] = useState(false);

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
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data || gameWon) return;

    const userGuess = guess.trim().toUpperCase();
    setAttempts(p => p + 1);

    if (userGuess === data.word) {
      setGameWon(true);
      setMessage('CORRECT! You are a genius!');
      // Score calculation: Base 100, minus 10 per wrong attempt. Min 10.
      const calcScore = Math.max(10, 100 - (attempts * 10) - (showHint ? 20 : 0));
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
