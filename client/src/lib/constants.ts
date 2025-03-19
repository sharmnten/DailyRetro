// Colors based on design reference
export const COLORS = {
  purple: '#8C3FFF',
  red: '#FF5454',
  gold: '#FFD166',
  dark: '#1A1A2E',
  light: '#F2F2F2'
};

// Game types
export const GAME_TYPES = {
  PACMAN: 'pacman',
  SPACE_INVADERS: 'space-invaders',
  FROGGER: 'frogger',
  SNAKE: 'snake',
  BREAKOUT: 'breakout',
  ASTEROIDS: 'asteroids',
  PONG: 'pong'
};

// Date formatter for displaying dates
export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric'
  }).format(date);
};

// Get today's date in YYYY-MM-DD format
export const getTodayDateString = () => {
  return new Date().toISOString().split('T')[0];
};

// Calculate time remaining until next day
export const getTimeUntilTomorrow = () => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  const timeRemaining = tomorrow.getTime() - now.getTime();
  
  const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
  
  return {
    hours,
    minutes,
    seconds,
    formatted: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  };
};

// Format a score with commas (e.g., 1,250)
export const formatScore = (score: number) => {
  return score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Time ago formatter for showing when scores were submitted
export const timeAgo = (date: Date | string) => {
  const now = new Date();
  const past = typeof date === 'string' ? new Date(date) : date;
  const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);
  
  if (seconds < 60) return `${seconds} seconds ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
};
