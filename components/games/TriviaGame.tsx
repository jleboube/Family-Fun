import React, { useState, useEffect } from 'react';
import { generateTriviaQuestions } from '../../services/geminiService';
import { Question } from '../../types';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

interface TriviaGameProps {
  onEndGame: (score: number, maxScore: number) => void;
  isActive: boolean;
}

const TriviaGame: React.FC<TriviaGameProps> = ({ onEndGame, isActive }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (isActive && questions.length === 0) {
      loadQuestions();
    }
  }, [isActive]);

  const loadQuestions = async () => {
    setLoading(true);
    const data = await generateTriviaQuestions(5);
    setQuestions(data);
    setLoading(false);
  };

  const handleOptionClick = (option: string) => {
    if (showResult) return;
    setSelectedOption(option);
    setShowResult(true);

    if (option === questions[currentIdx].correctAnswer) {
      setScore(s => s + 10);
    }

    setTimeout(() => {
      handleNext();
    }, 2500); // 2.5s delay to read explanation
  };

  const handleNext = () => {
    setSelectedOption(null);
    setShowResult(false);
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(p => p + 1);
    } else {
      onEndGame(score + (selectedOption === questions[currentIdx]?.correctAnswer ? 10 : 0), questions.length * 10);
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center space-y-4 p-8">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-gray-500 text-center">Consulting the Oracle of Knowledge...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return <div className="p-8 text-center text-red-500">Failed to load questions. Please try again.</div>;
  }

  const currentQ = questions[currentIdx];

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-6">
        <div className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
          Question {currentIdx + 1} of {questions.length}
        </div>
        <h3 className="text-2xl font-bold text-gray-900 leading-tight">
          {currentQ.text}
        </h3>
      </div>

      <div className="flex-1 space-y-3">
        {currentQ.options.map((option, idx) => {
          let btnClass = "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 font-medium text-lg ";
          if (showResult) {
            if (option === currentQ.correctAnswer) {
              btnClass += "bg-green-50 border-green-500 text-green-700";
            } else if (option === selectedOption) {
              btnClass += "bg-red-50 border-red-500 text-red-700";
            } else {
              btnClass += "bg-gray-50 border-transparent text-gray-400 opacity-50";
            }
          } else {
            btnClass += "bg-white border-gray-100 hover:border-primary hover:bg-indigo-50 text-gray-700 hover:shadow-md";
          }

          return (
            <button
              key={idx}
              onClick={() => handleOptionClick(option)}
              disabled={showResult}
              className={btnClass}
            >
              <div className="flex items-center justify-between">
                <span>{option}</span>
                {showResult && option === currentQ.correctAnswer && <CheckCircle2 className="text-green-600" size={24} />}
                {showResult && option === selectedOption && option !== currentQ.correctAnswer && <XCircle className="text-red-600" size={24} />}
              </div>
            </button>
          );
        })}
      </div>

      {showResult && (
        <div className="mt-4 p-4 bg-blue-50 text-blue-800 rounded-xl animate-in fade-in slide-in-from-bottom-2">
          <p className="font-bold mb-1">Did you know?</p>
          <p className="text-sm opacity-90">{currentQ.explanation}</p>
        </div>
      )}
    </div>
  );
};

export default TriviaGame;
