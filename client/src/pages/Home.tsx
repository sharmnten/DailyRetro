import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import GameSection from '@/components/GameSection';
import SidePanel from '@/components/SidePanel';
import Footer from '@/components/Footer';
import { apiRequest } from '@/lib/queryClient';
import { getTodayDateString } from '@/lib/constants';

export default function Home() {
  const { toast } = useToast();
  const [guestId, setGuestId] = useState<number | null>(null);
  const [currentScore, setCurrentScore] = useState<number>(0);
  
  // Get all games to populate calendar and upcoming games
  const { data: games = [] } = useQuery({
    queryKey: ['/api/games'],
  });
  
  // Get today's game
  const { data: currentGame, isLoading: isLoadingGame } = useQuery({
    queryKey: ['/api/games/today'],
  });
  
  // Create guest user for score tracking
  useEffect(() => {
    const createGuestUser = async () => {
      try {
        const res = await apiRequest('POST', '/api/users/guest', {});
        const data = await res.json();
        setGuestId(data.id);
      } catch (error) {
        console.error('Failed to create guest user:', error);
        toast({
          title: 'Error',
          description: 'Failed to create guest user. Some features may be limited.',
          variant: 'destructive',
        });
      }
    };
    
    createGuestUser();
  }, [toast]);
  
  // Calculate the day number (days since Jan 1, 2023)
  const calculateDayNumber = () => {
    const start = new Date('2023-01-01').getTime();
    const now = new Date().getTime();
    return Math.floor((now - start) / (1000 * 60 * 60 * 24)) + 1;
  };
  
  const handleScoreChange = (score: number) => {
    setCurrentScore(score);
  };
  
  const handleGameComplete = async (score: number) => {
    if (!guestId || !currentGame) return;
    
    try {
      await apiRequest('POST', '/api/scores', {
        gameId: currentGame.id,
        userId: guestId,
        score,
        date: getTodayDateString()
      });
      
      // Invalidate scores cache to refresh leaderboard
      //queryClient.invalidateQueries({ queryKey: [`/api/scores/${currentGame.id}`] });
      
    } catch (error) {
      console.error('Failed to submit score:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit your score.',
        variant: 'destructive',
      });
    }
  };
  
  const handleOpenScores = () => {
    toast({
      title: 'Scores',
      description: 'Leaderboard feature coming soon!',
    });
  };
  
  const handleOpenSettings = () => {
    toast({
      title: 'Settings',
      description: 'Settings feature coming soon!',
    });
  };
  
  return (
    <div className="container mx-auto px-4 py-8 flex flex-col min-h-screen bg-[#1A1A2E] text-[#F2F2F2] font-sans">
      <Header 
        currentGame={currentGame} 
        onOpenScores={handleOpenScores} 
        onOpenSettings={handleOpenSettings}
        day={calculateDayNumber()}
      />
      
      <main className="flex-grow flex flex-col lg:flex-row gap-6">
        <GameSection 
          currentGame={currentGame}
          onScoreChange={handleScoreChange}
          onGameComplete={handleGameComplete}
        />
        
        <SidePanel 
          games={games} 
          currentGame={currentGame}
        />
      </main>
      
      <Footer />
    </div>
  );
}
