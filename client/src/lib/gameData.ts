import { GAME_TYPES } from "./constants";

// Game control instructions for different game types
export const gameInstructions = {
  [GAME_TYPES.PACMAN]: {
    title: "HOW TO PLAY",
    description: "Navigate through the maze, eating all dots while avoiding ghosts. Eat power pellets to temporarily hunt ghosts for bonus points!",
    controls: [
      { key: "UP", description: "Move Up", icon: "arrow-up" },
      { key: "DOWN", description: "Move Down", icon: "arrow-down" },
      { key: "LEFT", description: "Move Left", icon: "arrow-left" },
      { key: "RIGHT", description: "Move Right", icon: "arrow-right" }
    ],
    tip: "On mobile, you can also use swipe gestures to move in any direction!"
  },
  [GAME_TYPES.SPACE_INVADERS]: {
    title: "HOW TO PLAY",
    description: "Defend Earth from waves of alien invaders. Shoot them down before they reach you!",
    controls: [
      { key: "LEFT", description: "Move Left", icon: "arrow-left" },
      { key: "RIGHT", description: "Move Right", icon: "arrow-right" },
      { key: "SPACE", description: "Fire", icon: "bolt" }
    ],
    tip: "On mobile, touch left/right sides to move and tap to fire!"
  },
  [GAME_TYPES.FROGGER]: {
    title: "HOW TO PLAY",
    description: "Help the frog cross the busy road and dangerous river to reach home safely.",
    controls: [
      { key: "UP", description: "Move Up", icon: "arrow-up" },
      { key: "DOWN", description: "Move Down", icon: "arrow-down" },
      { key: "LEFT", description: "Move Left", icon: "arrow-left" },
      { key: "RIGHT", description: "Move Right", icon: "arrow-right" }
    ],
    tip: "Time your movements carefully between vehicles and on floating logs!"
  },
  [GAME_TYPES.SNAKE]: {
    title: "HOW TO PLAY",
    description: "Grow your snake by eating food, but don't hit the walls or yourself!",
    controls: [
      { key: "UP", description: "Move Up", icon: "arrow-up" },
      { key: "DOWN", description: "Move Down", icon: "arrow-down" },
      { key: "LEFT", description: "Move Left", icon: "arrow-left" },
      { key: "RIGHT", description: "Move Right", icon: "arrow-right" }
    ],
    tip: "Plan your path carefully - your snake gets longer with each food item!"
  },
  [GAME_TYPES.BREAKOUT]: {
    title: "HOW TO PLAY",
    description: "Break all the bricks by bouncing the ball with your paddle.",
    controls: [
      { key: "LEFT", description: "Move Left", icon: "arrow-left" },
      { key: "RIGHT", description: "Move Right", icon: "arrow-right" }
    ],
    tip: "Hit the ball with different parts of the paddle to change its direction!"
  },
  [GAME_TYPES.ASTEROIDS]: {
    title: "HOW TO PLAY",
    description: "Destroy asteroids and avoid collisions in space.",
    controls: [
      { key: "UP", description: "Thrust", icon: "arrow-up" },
      { key: "LEFT", description: "Rotate Left", icon: "arrow-left" },
      { key: "RIGHT", description: "Rotate Right", icon: "arrow-right" },
      { key: "SPACE", description: "Fire", icon: "bolt" }
    ],
    tip: "Watch out for asteroid fragments when you shoot larger asteroids!"
  },
  [GAME_TYPES.PONG]: {
    title: "HOW TO PLAY",
    description: "Classic table tennis game. Beat the computer by scoring 11 points first!",
    controls: [
      { key: "UP", description: "Move Up", icon: "arrow-up" },
      { key: "DOWN", description: "Move Down", icon: "arrow-down" }
    ],
    tip: "Try to predict where the ball will go by watching its angle!"
  }
};

// Default instructions for any game type not defined above
export const defaultInstructions = {
  title: "HOW TO PLAY",
  description: "Use the controls to play this arcade classic!",
  controls: [
    { key: "ARROWS", description: "Movement", icon: "arrows" },
    { key: "SPACE", description: "Action", icon: "bolt" }
  ],
  tip: "Check the in-game instructions for more details!"
};

// Get instructions for a specific game type
export const getGameInstructions = (gameType: string) => {
  return gameInstructions[gameType as keyof typeof gameInstructions] || defaultInstructions;
};
