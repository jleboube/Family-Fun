import React, { useState, useEffect } from 'react';
import { generateLogicPuzzle } from '../../services/geminiService';
import { LogicPuzzle } from '../../types';
import { Loader2, BrainCircuit } from 'lucide-react';

interface LogicLabProps {
  onEndGame: (score: number, maxScore: number) => void;
  isActive: boolean;
}

const LogicLab: React.FC<LogicLabProps> = ({ onEndGame, isActive }) => {
  const [puzzle, setPuzzle] = useState<LogicPuzzle | null>(null);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [isRevealed, setIsRevealed] = useState(false);

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
  };

  const handleSelfGrade = (correct: boolean) => {
    // Logic puzzles are hard to regex match perfectly, so we use honor system or self-grading
    onEndGame(correct ? 50 : 0, 50);
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
             onClick={() => setIsRevealed(true)}
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
        </div>
      )}
    </div>
  );
};

export default LogicLab;
