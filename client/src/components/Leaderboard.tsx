import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { timeAgo, formatScore } from '@/lib/constants';
import { Score } from '@shared/schema';

interface LeaderboardProps {
  gameId: number;
}

export default function Leaderboard({ gameId }: LeaderboardProps) {
  // Get top scores for the current game
  const { data: scores, isLoading, error } = useQuery({
    queryKey: [`/api/scores/${gameId}`],
    enabled: gameId !== undefined
  });
  
  // Placeholder data in case of loading or error
  const placeholderScores = [
    {
      id: 1,
      username: 'LOADING...',
      score: 0,
      timestamp: new Date()
    }
  ];
  
  // Generate readable time ago string from timestamp
  const getTimeAgo = (timestamp: string) => {
    try {
      return timeAgo(timestamp);
    } catch (e) {
      return 'some time ago';
    }
  };
  
  return (
    <div className="bg-[#1A1A2E] rounded-lg p-4 shadow-[0_0_0_2px_#1A1A2E,0_0_0_4px_#FFD166] mb-6">
      <h3 className="font-['Press_Start_2P'] text-[#FFD166] text-sm md:text-base mb-4">TODAY'S TOP SCORES</h3>
      
      <div className="space-y-2">
        {isLoading ? (
          <div className="py-4 text-center">
            <div className="inline-block w-6 h-6 border-2 border-[#8C3FFF] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2 text-sm">Loading scores...</p>
          </div>
        ) : error ? (
          <div className="py-4 text-center">
            <p className="text-[#FF5454]">Failed to load scores</p>
          </div>
        ) : scores && scores.length > 0 ? (
          scores.map((score: any, index: number) => (
            <div key={score.id} className="flex items-center bg-black bg-opacity-30 p-2 rounded">
              <div className="w-6 h-6 rounded-full bg-[#8C3FFF] flex items-center justify-center mr-2 font-['Press_Start_2P'] text-xs">
                {index + 1}
              </div>
              <div className="flex-grow">
                <p className="text-sm font-bold">{score.username || `PLAYER_${score.userId}`}</p>
                <p className="text-xs text-gray-400">{getTimeAgo(score.timestamp)}</p>
              </div>
              <div className={`font-['Press_Start_2P'] ${index === 0 ? 'text-[#FFD166]' : 'text-white'}`}>
                {formatScore(score.score)}
              </div>
            </div>
          ))
        ) : (
          <div className="py-4 text-center">
            <p>No scores yet. Be the first to play!</p>
          </div>
        )}
      </div>
      
      <button className="w-full mt-4 bg-[#8C3FFF] hover:bg-opacity-80 transition rounded py-2 text-sm font-['Press_Start_2P']">
        VIEW ALL SCORES
      </button>
    </div>
  );
}
