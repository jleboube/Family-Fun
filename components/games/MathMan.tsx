import React, { useState, useEffect, useRef } from 'react';
import { generateMathProblem } from '../../services/geminiService';
import { MathProblem } from '../../types';
import { Loader2, Calculator, Check, X, Zap } from 'lucide-react';
import { useGameTiming } from '../GameShell';

interface MathManProps {
  onEndGame: (score: number, maxScore: number) => void;
  isActive: boolean;
}

// Calculate time bonus multiplier based on speed
// Faster answers = higher multiplier (1.0x to 2.0x)
const getTimeMultiplier = (secondsToAnswer: number, difficulty: string): number => {
  // Harder problems get more time allowance for max bonus
  const maxBonusTime = difficulty === 'hard' ? 15 : difficulty === 'medium' ? 10 : 5;

  if (secondsToAnswer <= maxBonusTime) return 2.0;      // Double points for fast answer
  if (secondsToAnswer <= maxBonusTime * 2) return 1.5;  // 1.5x for decent speed
  if (secondsToAnswer <= maxBonusTime * 3) return 1.25; // 1.25x for normal
  return 1.0;                                            // Base points for slow
};

const MathMan: React.FC<MathManProps> = ({ onEndGame, isActive }) => {
  const [problems, setProblems] = useState<MathProblem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [lastPoints, setLastPoints] = useState<number | null>(null);
  const problemStartTime = useRef<number>(Date.now());
  const { getElapsedTime } = useGameTiming();

  useEffect(() => {
    if (isActive && problems.length === 0) {
      loadGame();
    }
  }, [isActive]);

  const loadGame = async () => {
    setLoading(true);
    const data = await generateMathProblem();
    setProblems(data);
    setLoading(false);
    problemStartTime.current = Date.now();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback) return;

    const numAns = parseFloat(answer);
    const isCorrect = Math.abs(numAns - problems[currentIdx].answer) < 0.01;
    let pointsEarned = 0;

    if (isCorrect) {
      setFeedback('correct');
      // Base points based on difficulty
      let basePts = 10;
      if (problems[currentIdx].difficulty === 'medium') basePts = 20;
      if (problems[currentIdx].difficulty === 'hard') basePts = 30;

      // Apply time bonus multiplier
      const secondsToAnswer = (Date.now() - problemStartTime.current) / 1000;
      const multiplier = getTimeMultiplier(secondsToAnswer, problems[currentIdx].difficulty);
      pointsEarned = Math.round(basePts * multiplier);

      setScore(s => s + pointsEarned);
      setLastPoints(pointsEarned);
    } else {
      setFeedback('wrong');
      setLastPoints(0);
    }

    setTimeout(() => {
      setFeedback(null);
      setAnswer('');
      setLastPoints(null);
      problemStartTime.current = Date.now(); // Reset for next problem

      if (currentIdx < problems.length - 1) {
        setCurrentIdx(p => p + 1);
      } else {
        // Max score: assuming 3 problems with time bonus (easy 20, medium 40, hard 60) = 120 max
        onEndGame(score + pointsEarned, 120);
      }
    }, 1500);
  };

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center p-8">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
        <p className="text-gray-500">Crunching the numbers...</p>
      </div>
    );
  }

  if (problems.length === 0) return <div className="p-8">Error loading.</div>;

  const currentP = problems[currentIdx];

  return (
    <div className="p-6 h-full flex flex-col items-center text-center">
      <div className="bg-emerald-100 p-3 rounded-full mb-6">
        <Calculator className="text-emerald-700" size={32} />
      </div>

      <div className="w-full flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">
        <span>Problem {currentIdx + 1}/{problems.length}</span>
        <span className={
          currentP.difficulty === 'easy' ? 'text-green-500' :
          currentP.difficulty === 'medium' ? 'text-yellow-500' : 'text-red-500'
        }>{currentP.difficulty}</span>
      </div>

      <h3 className="text-3xl font-bold text-gray-900 mb-8 leading-relaxed">
        {currentP.question}
      </h3>

      <form onSubmit={handleSubmit} className="w-full max-w-xs relative">
        <input 
          type="number"
          step="any" 
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Answer"
          autoFocus
          className={`w-full text-center text-2xl font-bold p-4 border-2 rounded-xl outline-none transition-all
            ${feedback === 'correct' ? 'border-green-500 bg-green-50 text-green-800' : 
              feedback === 'wrong' ? 'border-red-500 bg-red-50 text-red-800' : 'border-gray-200 focus:border-emerald-500'}`}
        />
        
        {feedback === 'correct' && (
          <div className="absolute right-4 top-4 text-green-600 animate-in zoom-in"><Check /></div>
        )}
        {feedback === 'wrong' && (
          <div className="absolute right-4 top-4 text-red-600 animate-in zoom-in"><X /></div>
        )}

        {feedback === 'correct' && lastPoints !== null && (
          <div className="mt-3 flex items-center justify-center p-2 bg-green-50 text-green-700 rounded-lg animate-in fade-in">
            <Zap className="w-4 h-4 mr-1" />
            <span className="font-bold">+{lastPoints} pts</span>
            {lastPoints >= 30 && <span className="ml-2 text-xs opacity-75">Speed bonus!</span>}
          </div>
        )}
        {feedback === 'wrong' && (
          <div className="mt-3 text-center p-2 bg-red-50 text-red-700 rounded-lg animate-in fade-in text-sm">
            Correct answer: {problems[currentIdx].answer}
          </div>
        )}

        <button 
          type="submit" 
          disabled={!answer || feedback !== null}
          className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default MathMan;