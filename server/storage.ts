import { 
  users, type User, type InsertUser,
  games, type Game, type InsertGame,
  scores, type Score, type InsertScore,
  type GameParameters, type GameVariation
} from "@shared/schema";
import { generateDailyGame, generateGameVariation } from "./gameVariationGenerator";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Game methods
  getGames(): Promise<Game[]>;
  getGame(id: number): Promise<Game | undefined>;
  getGameByDate(date: string): Promise<Game | undefined>;
  createGame(game: InsertGame): Promise<Game>;
  
  // Score methods
  getScores(gameId: number, limit?: number): Promise<Score[]>;
  getTopScores(gameId: number, limit?: number): Promise<Score[]>;
  createScore(score: InsertScore): Promise<Score>;
  getUserScores(userId: number): Promise<Score[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private games: Map<number, Game>;
  private scores: Map<number, Score>;
  private userIdCounter: number;
  private gameIdCounter: number;
  private scoreIdCounter: number;

  constructor() {
    this.users = new Map();
    this.games = new Map();
    this.scores = new Map();
    this.userIdCounter = 1;
    this.gameIdCounter = 1;
    this.scoreIdCounter = 1;
    
    // Initialize with some default game data
    this.initializeGames();
  }

  // Initialize games using our game variation generator
  private initializeGames() {
    const today = new Date();
    
    // Get dates for this week (3 days past, today, and 3 days future)
    const dates = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - 3 + i);
      return date.toISOString().split('T')[0];
    });
    
    // Game type to icon mapping
    const gameIcons: Record<string, string> = {
      'pacman': 'gamepad',
      'space-invaders': 'rocket',
      'frogger': 'frog'
    };
    
    // Game type to instructions mapping
    const gameInstructions: Record<string, string> = {
      'pacman': 'Use arrow keys to move. Eat dots for points and power pellets to hunt ghosts!',
      'space-invaders': 'Use left/right to move and spacebar to shoot. Avoid enemy shots!',
      'frogger': 'Use arrow keys to move. Avoid traffic and use logs to cross the river.'
    };
    
    // Generate a variation for each date
    dates.forEach(date => {
      // Generate a unique daily game variation
      const variation = generateDailyGame(date);
      
      // Create the game entry with parameters from the variation
      const game: InsertGame = {
        name: variation.name,
        type: variation.gameType,
        description: variation.description,
        instructions: gameInstructions[variation.gameType] || 'Use arrow keys to control the game.',
        date: date,
        icon: gameIcons[variation.gameType] || 'gamepad',
        parameters: JSON.stringify(variation.parameters),
        variationId: variation.id
      };
      
      // Add the game to storage
      this.createGame(game);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Game methods
  async getGames(): Promise<Game[]> {
    return Array.from(this.games.values());
  }
  
  async getGame(id: number): Promise<Game | undefined> {
    return this.games.get(id);
  }
  
  async getGameByDate(date: string): Promise<Game | undefined> {
    return Array.from(this.games.values()).find(
      (game) => game.date === date,
    );
  }
  
  async createGame(insertGame: InsertGame): Promise<Game> {
    const id = this.gameIdCounter++;
    
    // Ensure all required fields are set
    const game: Game = { 
      ...insertGame, 
      id,
      parameters: insertGame.parameters || '{}', 
      variationId: insertGame.variationId || 0
    };
    
    this.games.set(id, game);
    return game;
  }
  
  // Score methods
  async getScores(gameId: number, limit?: number): Promise<Score[]> {
    const filtered = Array.from(this.scores.values()).filter(
      (score) => score.gameId === gameId,
    );
    
    const sorted = filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return limit ? sorted.slice(0, limit) : sorted;
  }
  
  async getTopScores(gameId: number, limit: number = 5): Promise<Score[]> {
    const filtered = Array.from(this.scores.values()).filter(
      (score) => score.gameId === gameId,
    );
    
    const sorted = filtered.sort((a, b) => b.score - a.score);
    return sorted.slice(0, limit);
  }
  
  async createScore(insertScore: InsertScore): Promise<Score> {
    const id = this.scoreIdCounter++;
    const score: Score = { 
      ...insertScore, 
      id, 
      timestamp: new Date() 
    };
    this.scores.set(id, score);
    return score;
  }
  
  async getUserScores(userId: number): Promise<Score[]> {
    return Array.from(this.scores.values())
      .filter((score) => score.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
}

export const storage = new MemStorage();
