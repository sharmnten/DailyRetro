import { useState, useEffect } from 'react';
import { Game } from '@shared/schema';
import { Link } from 'wouter';

interface CalendarViewProps {
  games: Game[];
  currentDate: string;
}

export default function CalendarView({ games, currentDate }: CalendarViewProps) {
  const [calendarDays, setCalendarDays] = useState<{ 
    date: string, 
    day: number, 
    isCurrentMonth: boolean, 
    hasGame: boolean, 
    isToday: boolean, 
    isPast: boolean,
    isInFuture: boolean 
  }[]>([]);
  
  // Generate calendar data
  useEffect(() => {
    const today = new Date(currentDate);
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Get the first day of the month
    const firstDay = new Date(currentYear, currentMonth, 1);
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Get the last day of the month
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Get the previous month's last days to fill in the calendar
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    
    const days = [];
    
    // Fill in days from previous month
    for (let i = 0; i < startingDayOfWeek; i++) {
      const date = new Date(currentYear, currentMonth - 1, prevMonthLastDay - startingDayOfWeek + i + 1);
      days.push({
        date: date.toISOString().split('T')[0],
        day: prevMonthLastDay - startingDayOfWeek + i + 1,
        isCurrentMonth: false,
        hasGame: games.some(game => game.date === date.toISOString().split('T')[0]),
        isToday: false,
        isPast: date < today,
        isInFuture: date > today
      });
    }
    
    // Fill in days from current month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth, i);
      days.push({
        date: date.toISOString().split('T')[0],
        day: i,
        isCurrentMonth: true,
        hasGame: games.some(game => game.date === date.toISOString().split('T')[0]),
        isToday: date.toISOString().split('T')[0] === currentDate,
        isPast: date < today && date.toISOString().split('T')[0] !== currentDate,
        isInFuture: date > today
      });
    }
    
    // Fill in days from next month to complete the grid
    const remainingDays = 7 - (days.length % 7);
    if (remainingDays < 7) {
      for (let i = 1; i <= remainingDays; i++) {
        const date = new Date(currentYear, currentMonth + 1, i);
        days.push({
          date: date.toISOString().split('T')[0],
          day: i,
          isCurrentMonth: false,
          hasGame: games.some(game => game.date === date.toISOString().split('T')[0]),
          isToday: false,
          isPast: false,
          isInFuture: true
        });
      }
    }
    
    setCalendarDays(days);
  }, [games, currentDate]);
  
  return (
    <div className="bg-[#1A1A2E] rounded-lg p-4 shadow-[0_0_0_2px_#1A1A2E,0_0_0_4px_#FFD166] mb-6">
      <h3 className="font-['Press_Start_2P'] text-[#FFD166] text-sm md:text-base mb-4">CHALLENGE CALENDAR</h3>
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        <div className="text-center text-xs text-[#8C3FFF] font-['Press_Start_2P']">S</div>
        <div className="text-center text-xs text-[#8C3FFF] font-['Press_Start_2P']">M</div>
        <div className="text-center text-xs text-[#8C3FFF] font-['Press_Start_2P']">T</div>
        <div className="text-center text-xs text-[#8C3FFF] font-['Press_Start_2P']">W</div>
        <div className="text-center text-xs text-[#8C3FFF] font-['Press_Start_2P']">T</div>
        <div className="text-center text-xs text-[#8C3FFF] font-['Press_Start_2P']">F</div>
        <div className="text-center text-xs text-[#8C3FFF] font-['Press_Start_2P']">S</div>
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          let bgClass = 'bg-black bg-opacity-30'; // Default for days from other months
          let textClass = 'text-gray-500';
          let interactiveClasses = '';
          
          if (day.isCurrentMonth) {
            if (day.isToday) {
              bgClass = 'bg-[#FF5454]';
              textClass = 'text-white font-bold';
              interactiveClasses = 'animate-pulse cursor-pointer';
            } else if (day.hasGame && day.isPast) {
              bgClass = 'bg-[#FF5454] bg-opacity-20';
              textClass = 'text-white';
              interactiveClasses = 'cursor-pointer hover:bg-opacity-40 transition';
            } else if (day.isInFuture) {
              bgClass = 'bg-black bg-opacity-50';
              textClass = 'text-gray-400';
            }
          }
          
          return (
            <div 
              key={index}
              className={`aspect-square ${bgClass} rounded flex items-center justify-center text-xs ${textClass} ${interactiveClasses}`}
            >
              {day.day}
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 flex justify-between text-xs">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-[#FF5454] rounded-full mr-1"></div>
          <span>Today</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-[#FF5454] bg-opacity-20 rounded-full mr-1"></div>
          <span>Completed</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-black bg-opacity-50 rounded-full mr-1"></div>
          <span>Future</span>
        </div>
      </div>
    </div>
  );
}
