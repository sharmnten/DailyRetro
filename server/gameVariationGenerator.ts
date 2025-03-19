import { GameParameters, GameVariation } from '../shared/schema';

// Game types
const GAME_TYPES = ['pacman', 'space-invaders', 'frogger'];

// Themes
const THEMES = [
  { id: 1, name: 'Classic' },
  { id: 2, name: 'Neon' },
  { id: 3, name: 'Retro' },
  { id: 4, name: 'Dark' },
  { id: 5, name: 'Pastel' },
];

// Special features by game type
const SPECIAL_FEATURES: Record<string, string[]> = {
  pacman: [
    'ghost_frenzy', 'maze_rotation', 'invisible_walls', 'reverse_controls',
    'double_dots', 'super_pellets', 'teleporting_ghosts', 'fog_of_war',
    'moving_walls', 'bonus_fruits', 'ghost_allies', 'maze_shuffle'
  ],
  'space-invaders': [
    'multi_shot', 'shield_boost', 'rapid_fire', 'enemy_missiles',
    'asteroid_field', 'boss_battle', 'bomb_drop', 'alien_swarm',
    'bullet_time', 'ship_upgrade', 'invincibility', 'bullet_reflection'
  ],
  frogger: [
    'double_speed', 'time_bonus', 'moving_logs', 'water_current',
    'flying_birds', 'bonus_insects', 'shrinking_platforms', 'slippery_logs',
    'predator_fish', 'fog_effect', 'falling_objects', 'changing_tides'
  ]
};

// Game-specific parameters
const GAME_SPECIFIC_PARAMS: Record<string, Record<string, any>> = {
  pacman: {
    ghostSpeedRange: [0.5, 2.5],
    mazeComplexity: ['simple', 'normal', 'complex', 'extreme'],
    powerPelletDuration: [3, 5, 7, 10, 15],
    fruitSpawnRate: [0.1, 0.2, 0.3, 0.4, 0.5],
  },
  'space-invaders': {
    enemyFormations: ['standard', 'arrow', 'wave', 'random', 'spiral'],
    bulletSpeed: [1, 1.5, 2, 2.5, 3],
    enemyDescendRate: [0.5, 1, 1.5, 2, 2.5],
    shieldCount: [0, 1, 2, 3, 4],
  },
  frogger: {
    trafficDensity: [0.3, 0.4, 0.5, 0.6, 0.7],
    riverSpeed: [0.8, 1, 1.2, 1.5, 1.8],
    safeZones: [1, 2, 3, 4, 5],
    timePerLevel: [30, 45, 60, 75, 90],
  }
};

// Name generators
function generateVariationName(gameType: string, params: GameParameters): string {
  const prefixes: Record<string, string[]> = {
    pacman: ['Haunted', 'Frenzied', 'Labyrinthine', 'Phantom', 'Spectral', 'Maze'],
    'space-invaders': ['Galactic', 'Cosmic', 'Orbital', 'Stellar', 'Asteroid', 'Alien'],
    frogger: ['Rushing', 'Raging', 'Treacherous', 'Flooded', 'Traffic', 'Highway']
  };
  
  const suffixes: Record<string, string[]> = {
    pacman: ['Chase', 'Maze', 'Frenzy', 'Feast', 'Hunt', 'Escape'],
    'space-invaders': ['Attack', 'Defense', 'Invasion', 'Warfare', 'Assault', 'Battle'],
    frogger: ['Crossing', 'Rush', 'Hop', 'River', 'Journey', 'Challenge']
  };
  
  const difficultyTerms: Record<string, string> = {
    'easy': 'Novice',
    'medium': 'Adept',
    'hard': 'Expert',
    'expert': 'Master'
  };
  
  const prefix = prefixes[gameType][Math.floor(Math.random() * prefixes[gameType].length)];
  const suffix = suffixes[gameType][Math.floor(Math.random() * suffixes[gameType].length)];
  const difficultyTerm = difficultyTerms[params.difficulty];
  
  // Generate a name format like "Haunted Maze: Expert Challenge" or "Galactic Invasion: Novice Edition"
  return `${prefix} ${suffix}: ${difficultyTerm} ${params.speedMultiplier > 1.5 ? 'Turbo ' : ''}Challenge`;
}

// Description generator
function generateDescription(gameType: string, params: GameParameters): string {
  const baseDescriptions: Record<string, string[]> = {
    pacman: [
      'Navigate through a maze while avoiding ghosts',
      'Eat all dots while evading colorful ghosts',
      'Collect power pellets to turn the tables on the ghosts'
    ],
    'space-invaders': [
      'Defend Earth from waves of descending alien invaders',
      'Shoot down alien ships before they reach the bottom',
      'Protect your bases while eliminating the alien threat'
    ],
    frogger: [
      'Guide your frog safely across busy roads and hazardous rivers',
      'Hop through traffic and ride logs to reach safety',
      'Navigate through vehicles and water hazards to reach your home'
    ]
  };
  
  const difficultyDescriptions: Record<string, string> = {
    'easy': 'A relaxed challenge suitable for beginners.',
    'medium': 'A balanced challenge for casual players.',
    'hard': 'A demanding challenge that will test your skills.',
    'expert': 'An extreme challenge for the most skilled players.'
  };
  
  const specialFeatureDescriptions: Record<string, string> = {
    'ghost_frenzy': 'Ghosts move unpredictably and change directions frequently.',
    'maze_rotation': 'The maze periodically rotates, challenging your orientation.',
    'invisible_walls': 'Some walls appear and disappear, changing the maze layout.',
    'reverse_controls': 'Controls are occasionally reversed, testing your adaptation skills.',
    'multi_shot': 'Your ship can fire multiple shots simultaneously.',
    'shield_boost': 'Occasional shield power-ups provide temporary invulnerability.',
    'rapid_fire': 'Increased firing rate for your space cannon.',
    'enemy_missiles': 'Enemies fire tracking missiles that home in on your position.',
    'double_speed': 'Your frog moves twice as fast, but requires precise control.',
    'time_bonus': 'Collect clock icons for extra time.',
    'moving_logs': 'Logs shift positions and change direction unexpectedly.',
    'water_current': 'River currents push your frog in different directions.'
  };
  
  const baseDesc = baseDescriptions[gameType][Math.floor(Math.random() * baseDescriptions[gameType].length)];
  const diffDesc = difficultyDescriptions[params.difficulty];
  
  let specialDesc = '';
  if (params.specialFeatures.length > 0) {
    const feature = params.specialFeatures[0];
    specialDesc = specialFeatureDescriptions[feature] || `Features ${params.specialFeatures.join(', ')}.`;
  }
  
  return `${baseDesc}. ${diffDesc} ${specialDesc} Speed: ${params.speedMultiplier.toFixed(1)}x.`;
}

// Generate random parameters for a specific game type
function generateRandomParameters(gameType: string, seed?: number): GameParameters {
  // Use seed if provided, otherwise create a random one
  let seedValue = seed || Math.floor(Math.random() * 1000000);
  
  // Use the seed to ensure reproducible randomness
  const seededRandom = () => {
    // Simple but effective seeded random number generator
    let x = Math.sin(seedValue) * 10000;
    seedValue++; // Increment seed for next call
    return x - Math.floor(x);
  };
  
  // Random difficulty
  const difficulties: Array<'easy' | 'medium' | 'hard' | 'expert'> = ['easy', 'medium', 'hard', 'expert'];
  const difficulty = difficulties[Math.floor(seededRandom() * difficulties.length)];
  
  // Determine enemy count based on difficulty
  const baseEnemyCount = {
    'easy': 3,
    'medium': 4,
    'hard': 5,
    'expert': 6
  }[difficulty] || 4;
  
  // Add some randomness to enemy count
  const enemyCount = baseEnemyCount + Math.floor(seededRandom() * 3);
  
  // Speed multiplier based on difficulty with some randomness
  const baseSpeed = {
    'easy': 0.8,
    'medium': 1.0,
    'hard': 1.2,
    'expert': 1.5
  }[difficulty] || 1.0;
  
  const speedMultiplier = baseSpeed + (seededRandom() * 0.5 - 0.25);
  
  // Random number of lives based on difficulty
  const baseLives = {
    'easy': 5,
    'medium': 4,
    'hard': 3,
    'expert': 2
  }[difficulty] || 3;
  
  // Random special features
  const availableFeatures = SPECIAL_FEATURES[gameType] || [];
  const shuffledFeatures = [...availableFeatures].sort(() => seededRandom() - 0.5);
  
  // Select 1-3 features based on difficulty
  const featureCount = {
    'easy': 1,
    'medium': 2,
    'hard': 2,
    'expert': 3
  }[difficulty] || 1;
  
  const specialFeatures = shuffledFeatures.slice(0, featureCount);
  
  // Random bonus frequency
  const bonusFrequency = 0.1 + seededRandom() * 0.3; // 10-40% chance
  
  // Random theme
  const themeId = Math.floor(seededRandom() * THEMES.length) + 1;
  
  // Custom colors based on theme
  const themeColors: Record<number, Record<string, string>> = {
    1: { // Classic
      background: '#000000',
      player: '#FFFF00',
      enemy: '#FF0000',
      item: '#00FFFF'
    },
    2: { // Neon
      background: '#120458',
      player: '#F706CF',
      enemy: '#06F725',
      item: '#06D8F7'
    },
    3: { // Retro
      background: '#382800',
      player: '#B86F00',
      enemy: '#4F6228',
      item: '#CFAD00'
    },
    4: { // Dark
      background: '#0A0A0A',
      player: '#A6A6A6',
      enemy: '#4D4D4D',
      item: '#D9D9D9'
    },
    5: { // Pastel
      background: '#F0E6F2',
      player: '#A6D8D4',
      enemy: '#F2BAC9',
      item: '#BCD8A6'
    }
  };
  
  const customColors = themeColors[themeId] || themeColors[1];
  
  // Random time limit based on difficulty (optional)
  const timeLimit = difficulty === 'easy' || difficulty === 'medium' 
    ? undefined 
    : 60 + Math.floor(seededRandom() * 60); // 60-120 seconds for hard/expert
  
  return {
    difficulty,
    speedMultiplier,
    enemyCount,
    specialFeatures,
    layoutSeed: seedValue,
    timeLimit,
    livesCount: baseLives,
    bonusFrequency,
    customColors,
    themeId
  };
}

// Generate a complete game variation
export function generateGameVariation(
  id: number, 
  gameType: string, 
  date: string,
  seed?: number
): GameVariation {
  // Generate random parameters
  const parameters = generateRandomParameters(gameType, seed);
  
  // Generate name and description based on parameters
  const name = generateVariationName(gameType, parameters);
  const description = generateDescription(gameType, parameters);
  
  return {
    id,
    gameType,
    name,
    description,
    parameters,
    dateCreated: date
  };
}

// Generate a daily game - selects a game type and creates a variation
export function generateDailyGame(date: string): GameVariation {
  // Use date string as seed for consistent but different daily games
  const dateSeed = Array.from(date).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Get a consistent but rotating game type for each day
  const gameTypeIndex = dateSeed % GAME_TYPES.length;
  const gameType = GAME_TYPES[gameTypeIndex];
  
  // Generate a unique id based on the date
  const id = dateSeed % 600; // Limit to 600 variations
  
  // Generate the daily variation
  return generateGameVariation(id, gameType, date, dateSeed);
}

// Generate multiple game variations (for testing or pre-generating a catalog)
export function generateMultipleVariations(count: number): GameVariation[] {
  const variations: GameVariation[] = [];
  
  for (let i = 0; i < count; i++) {
    // Rotate through game types
    const gameType = GAME_TYPES[i % GAME_TYPES.length];
    
    // Generate a fake date for testing
    const daysToAdd = i;
    const date = new Date();
    date.setDate(date.getDate() + daysToAdd);
    const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
    
    variations.push(generateGameVariation(i + 1, gameType, dateString, i));
  }
  
  return variations;
}