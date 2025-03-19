import { useState, useEffect, useRef } from 'react';
import { Game as GameType } from '@shared/schema';
import GameCanvas from './games/GameCanvas';
import GameInstructions from './GameInstructions';
import { formatScore } from '@/lib/constants';

interface GameSectionProps {
  currentGame?: GameType;
  onScoreChange: (score: number) => void;
  onGameComplete: (score: number) => void;
}

export default function GameSection({ currentGame, onScoreChange, onGameComplete }: GameSectionProps) {
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showGameOver, setShowGameOver] = useState<boolean>(false);
  const [showLoading, setShowLoading] = useState<boolean>(false);
  const [finalScore, setFinalScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const gameCanvasRef = useRef<HTMLDivElement>(null);
  
  // Reset game state when the current game changes
  useEffect(() => {
    setCurrentScore(0);
    setIsPaused(false);
    setShowGameOver(false);
    setShowLoading(true);
    
    // Simulate loading the game
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [currentGame]);
  
  const handleScoreChange = (score: number) => {
    setCurrentScore(score);
    onScoreChange(score);
  };
  
  const handleGameOver = (score: number) => {
    setFinalScore(score);
    setShowGameOver(true);
    onGameComplete(score);
    
    // Set a mock high score for now
    setHighScore(Math.max(score + Math.floor(Math.random() * 3000) + 1000, highScore));
  };
  
  const handlePauseToggle = () => {
    setIsPaused(!isPaused);
  };
  
  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };
  
  const handleRestart = () => {
    setShowGameOver(false);
    setCurrentScore(0);
    setIsPaused(false);
    
    // Force game canvas to reset
    if (gameCanvasRef.current) {
      const event = new CustomEvent('resetGame');
      gameCanvasRef.current.dispatchEvent(event);
    }
  };
  
  const handlePlayAgain = () => {
    setShowGameOver(false);
    handleRestart();
  };
  
  const handleShareScore = () => {
    // In a real app, this would share the score on social media
    alert(`You shared your score of ${finalScore}!`);
  };
  
  return (
    <section className="lg:w-3/4 flex flex-col">
      {/* Game viewport */}
      <div 
        ref={gameCanvasRef}
        className="relative bg-black rounded-lg overflow-hidden shadow-[0_0_0_2px_#1A1A2E,0_0_0_4px_#FFD166] flex-grow flex flex-col"
      >
        {/* Game screen */}
        <div id="game-viewport" className="relative flex-grow flex items-center justify-center">
          {currentGame && (
            <GameCanvas 
              gameType={currentGame.type}
              isPaused={isPaused}
              isMuted={isMuted}
              onScoreChange={handleScoreChange}
              onGameOver={handleGameOver}
            />
          )}
          
          {/* Overlay effects for retro feel */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.03] to-transparent bg-[size:100%_4px] pointer-events-none"></div>
          <div className="absolute inset-0 bg-radial-gradient pointer-events-none"></div>
          
          {/* Game loading state */}
          {showLoading && (
            <div className="absolute inset-0 bg-[#1A1A2E] bg-opacity-80 flex items-center justify-center">
              <div className="text-center">
                <div className="inline-block w-16 h-16 border-4 border-[#FFD166] border-t-transparent rounded-full animate-spin"></div>
                <p className="font-['Press_Start_2P'] text-[#FFD166] mt-4">LOADING...</p>
              </div>
            </div>
          )}
          
          {/* Game completed state */}
          {showGameOver && (
            <div className="absolute inset-0 bg-[#1A1A2E] bg-opacity-90 flex items-center justify-center">
              <div className="text-center px-6 py-8 bg-[#1A1A2E] border-4 border-[#FFD166] rounded-lg">
                <h3 className="font-['Press_Start_2P'] text-[#FFD166] text-xl mb-4">GAME OVER!</h3>
                <p className="text-white mb-2">Your score: <span className="font-bold text-xl">{formatScore(finalScore)}</span></p>
                <p className="text-white mb-4">Daily high score: <span className="font-bold">{formatScore(highScore)}</span></p>
                <button 
                  onClick={handlePlayAgain}
                  className="bg-[#8C3FFF] hover:bg-opacity-80 transition px-6 py-3 rounded font-['Press_Start_2P'] text-white mb-3 w-full"
                >
                  PLAY AGAIN
                </button>
                <button 
                  onClick={handleShareScore}
                  className="bg-transparent border-2 border-[#FFD166] hover:bg-[#FFD166] hover:text-[#1A1A2E] transition px-6 py-3 rounded font-['Press_Start_2P'] text-[#FFD166] hover:text-[#1A1A2E] w-full"
                >
                  SHARE SCORE
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Game controls bar */}
        <div className="bg-[#1A1A2E] p-3 border-t-4 border-[#8C3FFF]">
          <div className="flex flex-wrap justify-between items-center">
            <div className="flex items-center">
              <button 
                onClick={handlePauseToggle}
                className="w-10 h-10 bg-[#FF5454] hover:bg-opacity-80 flex items-center justify-center rounded mr-2"
              >
                <i className={`fas fa-${isPaused ? 'play' : 'pause'} text-white`}></i>
              </button>
              <button 
                onClick={handleMuteToggle}
                className="w-10 h-10 bg-[#8C3FFF] hover:bg-opacity-80 flex items-center justify-center rounded mr-2"
              >
                <i className={`fas fa-volume-${isMuted ? 'mute' : 'up'} text-white`}></i>
              </button>
              <button 
                onClick={handleRestart}
                className="w-10 h-10 bg-[#1A1A2E] border-2 border-[#FFD166] hover:bg-[#FFD166] hover:text-[#1A1A2E] flex items-center justify-center rounded text-[#FFD166] hover:text-[#1A1A2E]"
              >
                <i className="fas fa-redo-alt"></i>
              </button>
            </div>
            
            <div className="hidden md:flex items-center">
              <span className="font-['Press_Start_2P'] text-sm text-[#FFD166] mr-2">SCORE:</span>
              <span className="font-['Press_Start_2P'] text-lg">{formatScore(currentScore)}</span>
            </div>
            
            <div className="flex md:hidden mt-2 w-full">
              <div className="w-full bg-black rounded p-2 flex justify-between">
                <span className="font-['Press_Start_2P'] text-sm text-[#FFD166]">SCORE:</span>
                <span className="font-['Press_Start_2P'] text-sm">{formatScore(currentScore)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Game instructions */}
      {currentGame && (
        <GameInstructions gameType={currentGame.type} />
      )}
    </section>
  );
}
