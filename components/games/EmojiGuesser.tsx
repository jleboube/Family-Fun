import React, { useState, useEffect, useRef } from 'react';
import { generateEmojiChallenge } from '../../services/geminiService';
import { EmojiChallenge } from '../../types';
import { Loader2, Lightbulb, Clapperboard, Zap } from 'lucide-react';
import { useGameTiming } from '../GameShell';

interface EmojiGuesserProps {
  onEndGame: (score: number, maxScore: number) => void;
  isActive: boolean;
}

// Calculate time bonus for emoji guessing
// Faster answers = more points (50-100 base, with hint penalty)
const calculateTimeBonus = (secondsToAnswer: number): number => {
  if (secondsToAnswer <= 10) return 100;     // Lightning fast: full points
  if (secondsToAnswer <= 20) return 85;      // Very fast
  if (secondsToAnswer <= 30) return 70;      // Fast
  if (secondsToAnswer <= 45) return 55;      // Normal
  return 40;                                  // Slow but correct
};

const EmojiGuesser: React.FC<EmojiGuesserProps> = ({ onEndGame, isActive }) => {
  const [data, setData] = useState<EmojiChallenge | null>(null);
  const [guess, setGuess] = useState('');
  const [loading, setLoading] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [lastPoints, setLastPoints] = useState<number | null>(null);
  const puzzleStartTime = useRef<number>(Date.now());
  const { getElapsedTime } = useGameTiming();

  useEffect(() => {
    if (isActive && !data) {
      loadGame();
    }
  }, [isActive]);

  const loadGame = async () => {
    setLoading(true);
    const result = await generateEmojiChallenge();
    setData(result);
    setLoading(false);
    puzzleStartTime.current = Date.now();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data || submitted) return;

    setSubmitted(true);

    // Loose matching logic
    const normalizedGuess = guess.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normalizedAnswer = data.phrase.toLowerCase().replace(/[^a-z0-9]/g, '');

    if (normalizedGuess === normalizedAnswer) {
      setIsCorrect(true);
      // Calculate time-based score
      const secondsToAnswer = (Date.now() - puzzleStartTime.current) / 1000;
      let score = calculateTimeBonus(secondsToAnswer);
      // Apply hint penalty (-20 points)
      if (showHint) score = Math.max(20, score - 20);
      setLastPoints(score);
      setTimeout(() => onEndGame(score, 100), 2500);
    } else {
      setIsCorrect(false);
      setLastPoints(0);
      setTimeout(() => onEndGame(0, 100), 3500);
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center p-8">
        <Loader2 className="w-12 h-12 text-yellow-500 animate-spin mb-4" />
        <p className="text-gray-500">Writing the emoji script...</p>
      </div>
    );
  }

  if (!data) return <div className="p-8">Error loading game.</div>;

  return (
    <div className="p-6 h-full flex flex-col items-center text-center">
      <div className="bg-yellow-100 p-3 rounded-full mb-4">
        <Clapperboard className="text-yellow-700" size={32} />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">Emoji Enigma</h3>
      <p className="text-gray-500 mb-6">Category: <span className="font-bold text-gray-800">{data.category}</span></p>

      <div className="text-6xl mb-8 animate-bounce">
        {data.emojis}
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
        <input 
          type="text" 
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          placeholder="What's the title?"
          disabled={submitted}
          className={`w-full text-center text-xl font-bold p-4 border-2 rounded-xl focus:ring-4 outline-none transition-all
            ${submitted 
              ? isCorrect ? 'border-green-500 bg-green-50 text-green-700' : 'border-red-500 bg-red-50 text-red-700'
              : 'border-gray-200 focus:border-yellow-400 focus:ring-yellow-400/20'
            }`}
          autoFocus
        />
        <button
          type="submit"
          disabled={guess.length === 0 || submitted}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
        >
          {submitted ? (isCorrect ? 'CORRECT!' : 'WRONG!') : 'GUESS'}
        </button>
      </form>

      {submitted && isCorrect && lastPoints !== null && (
        <div className="mt-4 flex items-center justify-center p-3 bg-green-50 text-green-700 rounded-xl animate-in fade-in">
          <Zap className="w-5 h-5 mr-2" />
          <span className="font-bold">+{lastPoints} points!</span>
          {lastPoints >= 85 && <span className="ml-2 text-sm opacity-75">Speed bonus!</span>}
        </div>
      )}

      {submitted && !isCorrect && (
         <div className="mt-4 text-red-500 font-medium">
           The answer was: {data.phrase}
         </div>
      )}

      {!submitted && !showHint && (
        <button 
          onClick={() => setShowHint(true)}
          className="mt-6 flex items-center text-sm text-gray-500 hover:text-yellow-600 transition-colors"
        >
          <Lightbulb size={16} className="mr-1" /> Need a hint? (-20 pts)
        </button>
      )}

      {showHint && (
        <div className="mt-4 text-yellow-700 font-medium animate-in fade-in bg-yellow-50 px-4 py-2 rounded-lg">
          HINT: {data.hint}
        </div>
      )}
    </div>
  );
};

export default EmojiGuesser;