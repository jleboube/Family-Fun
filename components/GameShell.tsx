import React, { useEffect, useState, useRef } from 'react';
import CheaterModal from './CheaterModal';

interface GameShellProps {
  title: string;
  timeLimitSeconds: number; // e.g., 300 for 5 minutes
  onTimeUp: () => void;
  onCheatDetected: () => void;
  isActive: boolean;
  children: React.ReactNode;
}

const GameShell: React.FC<GameShellProps> = ({ 
  title, 
  timeLimitSeconds, 
  onTimeUp, 
  onCheatDetected, 
  isActive, 
  children 
}) => {
  const [timeLeft, setTimeLeft] = useState(timeLimitSeconds);
  const [showCheater, setShowCheater] = useState(false);
  const cheatTriggeredRef = useRef(false);

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, onTimeUp]);

  // Anti-cheat detection
  useEffect(() => {
    if (!isActive) return;

    const handleVisibilityChange = () => {
      if (document.hidden && !cheatTriggeredRef.current) {
        cheatTriggeredRef.current = true;
        setShowCheater(true);
        onCheatDetected();
      }
    };

    const handleBlur = () => {
       if (!cheatTriggeredRef.current) {
         cheatTriggeredRef.current = true;
         setShowCheater(true);
         onCheatDetected();
       }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isActive, onCheatDetected]);

  const handleCheatAck = () => {
    setShowCheater(false);
    // cheatTriggeredRef.current = false; // Keep it triggered so they can't just spam it? Or reset?
    // Let's allow them to continue but the mark is permanent for this session score.
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <CheaterModal isOpen={showCheater} onAcknowledge={handleCheatAck} />
      
      <div className="flex justify-between items-center mb-4 px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800">{title}</h2>
        <div className={`font-mono font-bold text-xl ${timeLeft < 30 ? 'text-red-500 animate-pulse' : 'text-primary'}`}>
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden min-h-[400px]">
        {children}
      </div>
    </div>
  );
};

export default GameShell;
