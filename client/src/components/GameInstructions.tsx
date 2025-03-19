import { useState } from 'react';
import { getGameInstructions } from '@/lib/gameData';

interface GameInstructionsProps {
  gameType: string;
}

export default function GameInstructions({ gameType }: GameInstructionsProps) {
  const [isOpen, setIsOpen] = useState(true);
  const instructions = getGameInstructions(gameType);
  
  return (
    <div className="mt-6 bg-[#1A1A2E] rounded-lg p-4 shadow-[0_0_0_2px_#1A1A2E,0_0_0_4px_#FFD166]">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-['Press_Start_2P'] text-[#FFD166] text-sm md:text-base">
          {instructions.title}
        </h3>
        <button 
          className="text-white"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Hide instructions" : "Show instructions"}
        >
          <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'}`}></i>
        </button>
      </div>
      
      {isOpen && (
        <div id="instructions-content">
          <div className="mb-4">
            <p className="text-sm md:text-base mb-2">{instructions.description}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {instructions.controls.map((control, index) => (
              <div key={index} className="bg-black bg-opacity-50 p-2 rounded text-center">
                <div className="w-10 h-10 bg-[#8C3FFF] rounded-full flex items-center justify-center mx-auto mb-1">
                  <i className={`fas fa-${control.icon} text-white`}></i>
                </div>
                <p className="text-xs">{control.description}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-4 bg-[#FFD166] bg-opacity-10 rounded p-2 border-l-4 border-[#FFD166]">
            <p className="text-sm"><strong>Pro Tip:</strong> {instructions.tip}</p>
          </div>
        </div>
      )}
    </div>
  );
}
