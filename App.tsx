import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import GameHub from './components/GameHub';
import GameShell from './components/GameShell';
import TriviaGame from './components/games/TriviaGame';
import WordWizard from './components/games/WordWizard';
import LogicLab from './components/games/LogicLab';
import EmojiGuesser from './components/games/EmojiGuesser';
import MathMan from './components/games/MathMan';
import AdminPanel from './components/AdminPanel';
import LandingPage from './components/LandingPage'; // Import LandingPage
import { User, GameType } from './types';
import { getCurrentUser, logoutUser, saveScore, addCoins } from './services/storageService';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [page, setPage] = useState<string>('landing'); // Default to landing
  const [activeGame, setActiveGame] = useState<GameType | null>(null);
  const [cheatedInSession, setCheatedInSession] = useState(false);

  useEffect(() => {
    const loaded = getCurrentUser();
    if (loaded) {
      setUser(loaded);
      setPage('hub'); // Skip landing if logged in
    } else {
      setPage('landing');
    }
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    setPage('hub');
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setPage('landing'); // Go back to landing on logout
  };

  const handleUserUpdate = (u: User) => {
    setUser(u);
  };

  const handleStartGame = (type: GameType) => {
    setActiveGame(type);
    setCheatedInSession(false);
    setPage('game');
  };

  const handleCoinUpdate = () => {
    const freshUser = getCurrentUser();
    if (freshUser) setUser(freshUser);
  };

  const handleGameEnd = (score: number, maxScore: number) => {
    if (!user || !activeGame) return;

    let coinsEarned = 0;
    if (activeGame === GameType.BONUS_ROUND) {
      coinsEarned = 100;
    } else if (score >= maxScore * 0.9) { 
      coinsEarned = 10;
    } else if (score >= maxScore * 0.5) {
      coinsEarned = 2; 
    }

    if (coinsEarned > 0) {
      addCoins(user.id, coinsEarned);
      const updatedUser = getCurrentUser();
      if (updatedUser) setUser(updatedUser);
    }

    saveScore({
      id: crypto.randomUUID(),
      userId: user.id,
      gameType: activeGame,
      score,
      maxScore,
      timestamp: Date.now(),
      cheated: cheatedInSession
    });

    setActiveGame(null);
    setPage('dashboard');
  };

  const handleCheatDetected = () => {
    setCheatedInSession(true);
  };

  // ROUTING LOGIC

  // 1. Landing Page (Unauthenticated)
  if (!user && page === 'landing') {
    return <LandingPage onGetStarted={() => setPage('auth')} />;
  }

  // 2. Auth Page (Unauthenticated)
  if (!user && page === 'auth') {
    return <Auth onLogin={handleLogin} />;
  }
  
  // Fallback if user is null but page isn't landing/auth (shouldn't happen often)
  if (!user) {
     return <LandingPage onGetStarted={() => setPage('auth')} />;
  }

  // 3. Authenticated Pages
  const renderContent = () => {
    if (page === 'admin') {
      return user.role === 'admin' ? <AdminPanel /> : <div className="text-center p-10">Access Denied</div>;
    }

    if (page === 'dashboard') {
      return <Dashboard />;
    }

    if (page === 'game' && activeGame) {
      let GameComponent;
      let timeLimit = 300; 
      let title = "Game";

      switch (activeGame) {
        case GameType.TRIVIA:
          GameComponent = TriviaGame;
          title = "Trivia Time";
          break;
        case GameType.WORD_WIZARD:
          GameComponent = WordWizard;
          title = "Word Wizard";
          timeLimit = 180; 
          break;
        case GameType.LOGIC_LAB:
          GameComponent = LogicLab;
          title = "Logic Lab";
          timeLimit = 60; 
          break;
        case GameType.EMOJI_ENIGMA:
          GameComponent = EmojiGuesser;
          title = "Emoji Enigma";
          timeLimit = 120; 
          break;
        case GameType.MATH_MANIA:
          GameComponent = MathMan;
          title = "Math Mania";
          timeLimit = 180; 
          break;
        case GameType.BONUS_ROUND:
          GameComponent = LogicLab; 
          title = "BONUS ROUND";
          break;
        default:
          return <div>Unknown Game</div>;
      }

      return (
        <GameShell 
          title={title} 
          timeLimitSeconds={timeLimit} 
          onTimeUp={() => handleGameEnd(0, 100)} 
          onCheatDetected={handleCheatDetected}
          isActive={true}
        >
          <GameComponent 
            isActive={true} 
            onEndGame={handleGameEnd} 
          />
        </GameShell>
      );
    }

    return <GameHub onSelectGame={handleStartGame} user={user} onCoinsUpdated={handleCoinUpdate} />;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        currentPage={page} 
        onNavigate={(p) => { setActiveGame(null); setPage(p); }} 
        onUserUpdate={handleUserUpdate}
      />
      <main className="pt-6 px-4">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;