import React, { useState, useEffect, useRef } from 'react';
import { generateLogicPuzzle } from '../../services/geminiService';
import { LogicPuzzle } from '../../types';
import { Loader2, BrainCircuit, Zap } from 'lucide-react';
import { useGameTiming } from '../GameShell';

interface LogicLabProps {
  onEndGame: (score: number, maxScore: number) => void;
  isActive: boolean;
}

// Calculate time bonus for logic puzzles
// Faster answers = more points (25-50 base since it's self-graded)
const calculateTimeBonus = (secondsToAnswer: number): number => {
  if (secondsToAnswer <= 30) return 50;      // Lightning fast: full points
  if (secondsToAnswer <= 60) return 45;      // Very fast
  if (secondsToAnswer <= 90) return 40;      // Fast
  if (secondsToAnswer <= 120) return 35;     // Normal
  return 25;                                  // Slow but correct
};

const LogicLab: React.FC<LogicLabProps> = ({ onEndGame, isActive }) => {
  const [puzzle, setPuzzle] = useState<LogicPuzzle | null>(null);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [isRevealed, setIsRevealed] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState<number | null>(null);
  const puzzleStartTime = useRef<number>(Date.now());
  const revealTime = useRef<number>(Date.now());
  const { getElapsedTime } = useGameTiming();

  useEffect(() => {
    if (isActive && !puzzle) {
      loadPuzzle();
    }
  }, [isActive]);

  const loadPuzzle = async () => {
    setLoading(true);
    const data = await generateLogicPuzzle();
    setPuzzle(data);
    setLoading(false);
    puzzleStartTime.current = Date.now();
  };

  const handleReveal = () => {
    setIsRevealed(true);
    revealTime.current = Date.now();
  };

  const handleSelfGrade = (correct: boolean) => {
    if (correct) {
      // Calculate time-based score (time from start to reveal)
      const secondsToAnswer = (revealTime.current - puzzleStartTime.current) / 1000;
      const score = calculateTimeBonus(secondsToAnswer);
      setEarnedPoints(score);
      setTimeout(() => onEndGame(score, 50), 1500);
    } else {
      setEarnedPoints(0);
      setTimeout(() => onEndGame(0, 50), 1500);
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center p-8">
        <Loader2 className="w-12 h-12 text-accent animate-spin mb-4" />
        <p className="text-gray-500">Generating a brain twister...</p>
      </div>
    );
  }

  if (!puzzle) return <div className="p-8">Error loading puzzle.</div>;

  return (
    <div className="p-8 h-full flex flex-col items-center">
      <div className="bg-accent/10 p-4 rounded-full mb-6">
        <BrainCircuit size={40} className="text-accent" />
      </div>
      
      <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
        {puzzle.question}
      </h3>

      {!isRevealed ? (
        <div className="w-full max-w-sm space-y-4">
           <textarea
             value={answer}
             onChange={(e) => setAnswer(e.target.value)}
             placeholder="Type your reasoning here..."
             className="w-full p-4 border border-gray-200 rounded-xl focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none min-h-[100px]"
           />
           <button
             onClick={handleReveal}
             className="w-full bg-accent hover:bg-violet-600 text-white font-bold py-3 rounded-xl transition-colors"
           >
             Reveal Answer & Grade Me
           </button>
           <p className="text-xs text-center text-gray-400">
             Type your answer first, then reveal the solution to see if you were right!
           </p>
        </div>
      ) : (
        <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-gray-800 text-white p-6 rounded-xl mb-6 shadow-lg">
            <p className="text-xs text-gray-400 uppercase font-bold mb-1">Correct Answer</p>
            <p className="text-lg font-medium">{puzzle.answer}</p>
          </div>

          {earnedPoints === null ? (
            <>
              <p className="text-center font-bold text-gray-700 mb-4">Did you get it right?</p>

              <div className="grid grid-cols-2 gap-4">
                 <button
                   onClick={() => handleSelfGrade(false)}
                   className="py-3 px-4 rounded-xl border-2 border-red-100 bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors"
                 >
                   No, I missed it
                 </button>
                 <button
                   onClick={() => handleSelfGrade(true)}
                   className="py-3 px-4 rounded-xl bg-green-500 text-white font-bold hover:bg-green-600 transition-colors shadow-md"
                 >
                   Yes, I'm smart!
                 </button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center p-3 bg-green-50 text-green-700 rounded-xl animate-in fade-in">
              <Zap className="w-5 h-5 mr-2" />
              <span className="font-bold">+{earnedPoints} points!</span>
              {earnedPoints >= 45 && <span className="ml-2 text-sm opacity-75">Speed bonus!</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LogicLab;
