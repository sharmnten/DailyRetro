import { useState } from 'react';
import CalendarView from './CalendarView';
import Leaderboard from './Leaderboard';
import { Game } from '@shared/schema';

interface SidePanelProps {
  games: Game[];
  currentGame?: Game;
}

export default function SidePanel({ games, currentGame }: SidePanelProps) {
  // Get today's date for the calendar
  const today = new Date().toISOString().split('T')[0];
  
  // Get upcoming games (sorted by date, max 3)
  const upcomingGames = games
    .filter(game => game.date > today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);
    
  return (
    <aside className="lg:w-1/4">
      {/* Calendar section */}
      <CalendarView games={games} currentDate={today} />
      
      {/* Leaderboard section */}
      {currentGame && (
        <Leaderboard gameId={currentGame.id} />
      )}
      
      {/* Upcoming games preview */}
      <div className="bg-[#1A1A2E] rounded-lg p-4 shadow-[0_0_0_2px_#1A1A2E,0_0_0_4px_#FFD166]">
        <h3 className="font-['Press_Start_2P'] text-[#FFD166] text-sm md:text-base mb-4">COMING SOON</h3>
        
        <div className="space-y-3">
          {upcomingGames.map((game, index) => {
            // Calculate days from now
            const gameDate = new Date(game.date);
            const todayDate = new Date(today);
            const diffTime = Math.abs(gameDate.getTime() - todayDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const daysText = diffDays === 1 ? 'Tomorrow' : `In ${diffDays} days`;
            
            return (
              <div key={game.id} className="bg-black bg-opacity-40 rounded p-2 flex items-center">
                <div className="w-10 h-10 bg-[#8C3FFF] rounded flex items-center justify-center mr-3">
                  <i className={`fas fa-${game.icon} text-white`}></i>
                </div>
                <div>
                  <p className="text-sm font-bold">{game.name}</p>
                  <p className="text-xs text-gray-400">{daysText}</p>
                </div>
              </div>
            );
          })}
          
          {/* If we have fewer than 3 upcoming games, show placeholders */}
          {upcomingGames.length < 3 && (
            <div className="bg-black bg-opacity-40 rounded p-2 flex items-center">
              <div className="w-10 h-10 bg-[#8C3FFF] rounded flex items-center justify-center mr-3">
                <i className="fas fa-question text-white"></i>
              </div>
              <div>
                <p className="text-sm font-bold">Mystery Game</p>
                <p className="text-xs text-gray-400">Coming soon</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
