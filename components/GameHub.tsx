import React, { useEffect, useState } from 'react';
import { GameType, User } from '../types';
import { getScores, calculateStreak, deductCoins, deleteDailyScore } from '../services/storageService';
import { Brain, Sparkles, BookOpen, Calculator, SmilePlus, Star, Lock } from 'lucide-react';

interface GameHubProps {
  onSelectGame: (type: GameType) => void;
  user: User;
  onCoinsUpdated: () => void; // Trigger UI refresh
}

const GameHub: React.FC<GameHubProps> = ({ onSelectGame, user, onCoinsUpdated }) => {
  const [playedGames, setPlayedGames] = useState<Set<GameType>>(new Set());
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    refreshStatus();
  }, [user.id]);

  const refreshStatus = () => {
    const scores = getScores();
    const today = new Date().setHours(0,0,0,0);
    
    const playedToday = new Set<GameType>();
    scores.forEach(s => {
      if (s.userId === user.id && s.timestamp >= today) {
        playedToday.add(s.gameType);
      }
    });
    setPlayedGames(playedToday);
    setStreak(calculateStreak(user.id));
  };

  const handleGameClick = (gameId: GameType) => {
    if (playedGames.has(gameId)) {
      // Offer retry
      if (window.confirm(`You already played today! \n\nSpend 10 coins to retry for a better score? (You have ${user.coins} coins)`)) {
        if (deductCoins(user.id, 10)) {
          deleteDailyScore(user.id, gameId);
          onCoinsUpdated();
          refreshStatus();
          onSelectGame(gameId);
        } else {
          alert("Not enough coins!");
        }
      }
    } else {
      onSelectGame(gameId);
    }
  };

  const games = [
    {
      id: GameType.TRIVIA,
      title: "Trivia Time",
      description: "Test your knowledge across history, science, and pop culture.",
      icon: <BookOpen className="w-8 h-8 text-white" />,
      color: "from-blue-400 to-indigo-500",
      time: "5 min"
    },
    {
      id: GameType.WORD_WIZARD,
      title: "Word Wizard",
      description: "Guess the secret word based on the definition.",
      icon: <Sparkles className="w-8 h-8 text-white" />,
      color: "from-pink-400 to-rose-500",
      time: "3 min"
    },
    {
      id: GameType.LOGIC_LAB,
      title: "Logic Lab",
      description: "Brain teasers and riddles to stretch your mind.",
      icon: <Brain className="w-8 h-8 text-white" />,
      color: "from-violet-400 to-purple-500",
      time: "1 min"
    },
    {
      id: GameType.EMOJI_ENIGMA,
      title: "Emoji Enigma",
      description: "Decode the movie or phrase from the emojis.",
      icon: <SmilePlus className="w-8 h-8 text-white" />,
      color: "from-yellow-400 to-orange-500",
      time: "2 min"
    },
    {
      id: GameType.MATH_MANIA,
      title: "Math Mania",
      description: "Quick calculations to keep your brain sharp.",
      icon: <Calculator className="w-8 h-8 text-white" />,
      color: "from-emerald-400 to-teal-500",
      time: "3 min"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="text-center mb-8 mt-4">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">Game Center</h1>
        <div className="flex justify-center items-center space-x-2 text-sm font-medium text-gray-500">
          <span>Current Streak:</span>
          <span className="flex items-center text-orange-500 font-bold">
             <Star size={16} className="mr-1 fill-current" /> {streak} Days
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map(game => {
          const isPlayed = playedGames.has(game.id);
          return (
            <button
              key={game.id}
              onClick={() => handleGameClick(game.id)}
              className={`group relative flex flex-col items-start p-6 rounded-3xl shadow-sm border transition-all duration-300 transform overflow-hidden text-left
                ${isPlayed 
                  ? 'bg-gray-50 border-gray-200 grayscale opacity-80' 
                  : 'bg-white border-gray-100 hover:shadow-xl hover:-translate-y-1'
                }`}
            >
              <div className={`absolute top-0 right-0 p-4 rounded-bl-3xl bg-gradient-to-br ${game.color} shadow-lg ${!isPlayed && 'group-hover:scale-110 transition-transform'}`}>
                {game.icon}
              </div>
              
              <div className="mt-8 mb-4">
                <h3 className="text-xl font-bold text-gray-800">{game.title}</h3>
                <span className="inline-block mt-2 px-3 py-1 bg-gray-100 text-gray-500 text-xs font-bold rounded-full">
                  ⏱️ {game.time} limit
                </span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                {game.description}
              </p>
              
              {isPlayed && (
                <div className="w-full mt-auto pt-2 border-t border-gray-200">
                  <p className="text-xs font-bold text-green-600 text-center uppercase tracking-wider mb-1">Completed Today</p>
                  <p className="text-xs text-center text-gray-400">Click to Retry (10c)</p>
                </div>
              )}
            </button>
          );
        })}

        {/* Bonus Round Card */}
        <button
          onClick={() => streak >= 30 ? onSelectGame(GameType.BONUS_ROUND) : alert("Keep your streak alive for 30 days to unlock!")}
          className={`group relative flex flex-col items-start p-6 rounded-3xl border transition-all duration-300 overflow-hidden
            ${streak >= 30 
              ? 'bg-gradient-to-br from-indigo-900 to-purple-900 text-white shadow-xl hover:-translate-y-1' 
              : 'bg-gray-100 border-gray-200 cursor-not-allowed'
            }`}
        >
          <div className="absolute top-0 right-0 p-4">
             {streak >= 30 ? <Star className="w-8 h-8 text-yellow-400 fill-current animate-pulse" /> : <Lock className="w-8 h-8 text-gray-400" />}
          </div>
          
          <div className="mt-8 mb-4">
            <h3 className={`text-xl font-bold ${streak >= 30 ? 'text-white' : 'text-gray-500'}`}>30-Day Bonus</h3>
            <span className="inline-block mt-2 px-3 py-1 bg-white/10 text-xs font-bold rounded-full text-white/80">
              Only for Legends
            </span>
          </div>
          <p className={`text-sm leading-relaxed ${streak >= 30 ? 'text-indigo-200' : 'text-gray-400'}`}>
            A super secret challenge for the most dedicated family members. Win 100 coins!
          </p>
          {streak < 30 && (
             <div className="w-full mt-4 bg-gray-200 rounded-full h-2">
               <div className="bg-primary h-2 rounded-full" style={{ width: `${(streak / 30) * 100}%` }}></div>
             </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default GameHub;