import React, { useState, useEffect } from 'react';
import { generateMathProblem } from '../../services/geminiService';
import { MathProblem } from '../../types';
import { Loader2, Calculator, Check, X } from 'lucide-react';

interface MathManProps {
  onEndGame: (score: number, maxScore: number) => void;
  isActive: boolean;
}

const MathMan: React.FC<MathManProps> = ({ onEndGame, isActive }) => {
  const [problems, setProblems] = useState<MathProblem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

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
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback) return;

    const numAns = parseFloat(answer);
    const isCorrect = Math.abs(numAns - problems[currentIdx].answer) < 0.01;

    if (isCorrect) {
      setFeedback('correct');
      // Points based on difficulty: Easy(10), Medium(20), Hard(30) => Total 60 usually, scaled to ~100 max
      let pts = 10;
      if (problems[currentIdx].difficulty === 'medium') pts = 20;
      if (problems[currentIdx].difficulty === 'hard') pts = 30;
      setScore(s => s + pts);
    } else {
      setFeedback('wrong');
    }

    setTimeout(() => {
      setFeedback(null);
      setAnswer('');
      if (currentIdx < problems.length - 1) {
        setCurrentIdx(p => p + 1);
      } else {
        // Calculate final score percentage roughly
        // If they got all right (approx 60pts raw), give them 100 scaled? 
        // Let's just return the raw score, assuming specific max score passed to onEndGame
        onEndGame(score + (isCorrect ? (problems[currentIdx].difficulty === 'hard' ? 30 : problems[currentIdx].difficulty === 'medium' ? 20 : 10) : 0), 60);
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