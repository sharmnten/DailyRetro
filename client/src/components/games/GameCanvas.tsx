import { useState, useEffect, useRef } from 'react';
import PacmanGame from './PacmanGame';
import SpaceInvadersGame from './SpaceInvadersGame';
import FroggerGame from './FroggerGame';
import { GAME_TYPES } from '@/lib/constants';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/queryClient';
import type { GameParameters } from '@shared/schema';

interface GameCanvasProps {
  gameType: string;
  gameId: number; // Added gameId to fetch game parameters
  isPaused: boolean;
  isMuted: boolean;
  onScoreChange: (score: number) => void;
  onGameOver: (score: number) => void;
}

export default function GameCanvas({ 
  gameType,
  gameId,
  isPaused, 
  isMuted, 
  onScoreChange, 
  onGameOver 
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 400, height: 300 });
  
  // Fetch game parameters from API
  const { data: gameParameters, isLoading: isLoadingParameters } = useQuery({
    queryKey: ['/api/games', gameId, 'parameters'],
    queryFn: getQueryFn<GameParameters>({ on401: 'returnNull' }),
    enabled: !!gameId, // Only run the query if we have a gameId
    refetchOnWindowFocus: false
  });
  
  // Default parameters to use if none are available
  const defaultParameters: GameParameters = {
    difficulty: 'medium',
    speedMultiplier: 1.0,
    enemyCount: 4,
    specialFeatures: [],
    layoutSeed: 12345,
    livesCount: 3,
    bonusFrequency: 0.2,
    customColors: {
      background: '#000000',
      player: '#FFFF00',
      enemy: '#FF0000',
      item: '#00FFFF'
    }
  };
  
  // Update canvas size when window resizes
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        
        // Maintain aspect ratio
        const aspectRatio = 4 / 3;
        let newWidth = width;
        let newHeight = width / aspectRatio;
        
        // If height is too tall, constrain by height instead
        if (newHeight > height) {
          newHeight = height;
          newWidth = height * aspectRatio;
        }
        
        setCanvasSize({
          width: Math.floor(newWidth),
          height: Math.floor(newHeight)
        });
      }
    };
    
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, []);
  
  // Get the appropriate game component based on game type
  const GameComponent = () => {
    // Use game parameters if available, otherwise use defaults
    const parameters = gameParameters || defaultParameters;

    switch(gameType) {
      case GAME_TYPES.PACMAN:
        return (
          <PacmanGame 
            canvasRef={canvasRef}
            canvasSize={canvasSize}
            isPaused={isPaused}
            isMuted={isMuted}
            onScoreChange={onScoreChange}
            onGameOver={onGameOver}
            parameters={parameters}
          />
        );
      case GAME_TYPES.SPACE_INVADERS:
        return (
          <SpaceInvadersGame 
            canvasRef={canvasRef}
            canvasSize={canvasSize}
            isPaused={isPaused}
            isMuted={isMuted}
            onScoreChange={onScoreChange}
            onGameOver={onGameOver}
            parameters={parameters}
          />
        );
      case GAME_TYPES.FROGGER:
        return (
          <FroggerGame 
            canvasRef={canvasRef}
            canvasSize={canvasSize}
            isPaused={isPaused}
            isMuted={isMuted}
            onScoreChange={onScoreChange}
            onGameOver={onGameOver}
            parameters={parameters}
          />
        );
      default:
        // Fallback to Pacman as the default game
        return (
          <PacmanGame 
            canvasRef={canvasRef}
            canvasSize={canvasSize}
            isPaused={isPaused}
            isMuted={isMuted}
            onScoreChange={onScoreChange}
            onGameOver={onGameOver}
            parameters={parameters}
          />
        );
    }
  };
  
  // Show loading state while fetching parameters
  if (isLoadingParameters) {
    return (
      <div ref={containerRef} className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-2 border-t-2 border-primary rounded-full animate-spin"></div>
          <p className="text-sm text-muted-foreground">Loading game challenge...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      ref={containerRef} 
      className="w-full h-full flex items-center justify-center"
    >
      <GameComponent />
    </div>
  );
}
