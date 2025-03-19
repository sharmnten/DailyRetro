import { useState, useEffect } from 'react';
import { Game } from '@shared/schema';
import { getTimeUntilTomorrow } from '@/lib/constants';

interface HeaderProps {
  currentGame?: Game;
  onOpenScores: () => void;
  onOpenSettings: () => void;
  day: number;
}

export default function Header({ currentGame, onOpenScores, onOpenSettings, day }: HeaderProps) {
  const [timeRemaining, setTimeRemaining] = useState(getTimeUntilTomorrow().formatted);
  
  // Update the countdown timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(getTimeUntilTomorrow().formatted);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <header className="mb-6">
      <div className="flex flex-col md:flex-row items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-[#FFD166] rounded-lg flex items-center justify-center mr-3">
            <i className="fas fa-gamepad text-[#1A1A2E] text-xl"></i>
          </div>
          <h1 className="font-['Press_Start_2P'] text-2xl md:text-3xl text-[#8C3FFF]">
            RETRO<span className="text-[#FFD166]">DAILY</span>
          </h1>
        </div>
        
        <div className="flex mt-4 md:mt-0">
          <button 
            onClick={onOpenScores}
            className="bg-[#8C3FFF] hover:bg-opacity-80 transition px-4 py-2 rounded mr-2 text-sm font-['Press_Start_2P']"
          >
            <i className="fas fa-trophy mr-1"></i>
            SCORES
          </button>
          <button 
            onClick={onOpenSettings}
            className="bg-[#1A1A2E] border-2 border-[#FFD166] hover:bg-[#FFD166] hover:text-[#1A1A2E] transition px-4 py-2 rounded text-sm font-['Press_Start_2P'] text-[#FFD166] hover:text-[#1A1A2E]"
          >
            <i className="fas fa-cog mr-1"></i>
            SETTINGS
          </button>
        </div>
      </div>
      
      {/* Challenge indicator */}
      <div className="bg-[#FF5454] rounded-lg p-3 text-center mb-6 animate-pulse">
        <p className="font-['Press_Start_2P'] text-xs md:text-sm">
          TODAY'S CHALLENGE - DAY #{day}
        </p>
        <h2 className="font-['Press_Start_2P'] text-lg md:text-xl mt-1 text-white">
          {currentGame?.name || 'LOADING...'}
        </h2>
        <p className="font-sans text-xs mt-1">
          Next challenge in: <span className="font-bold">{timeRemaining}</span>
        </p>
      </div>
    </header>
  );
}
