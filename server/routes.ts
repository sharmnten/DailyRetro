import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertScoreSchema, type GameParameters } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { generateDailyGame, generateGameVariation, generateMultipleVariations } from "./gameVariationGenerator";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get today's game
  app.get("/api/games/today", async (req, res) => {
    const today = new Date().toISOString().split("T")[0];
    const game = await storage.getGameByDate(today);
    
    if (!game) {
      // If no game is found for today, generate one using the daily game generator
      const variation = generateDailyGame(today);
      
      // Create a new game from the variation
      const newGame = await storage.createGame({
        name: variation.name,
        type: variation.gameType,
        description: variation.description,
        instructions: `Use arrow keys to control the game.`,
        date: today,
        icon: variation.gameType === 'pacman' ? 'gamepad' : 
              variation.gameType === 'space-invaders' ? 'rocket' : 'frog',
        parameters: JSON.stringify(variation.parameters),
        variationId: variation.id
      });
      
      return res.json(newGame);
    }
    
    return res.json(game);
  });
  
  // Get game parameters by game ID
  app.get("/api/games/:id/parameters", async (req, res) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid game ID" });
    }
    
    const game = await storage.getGame(id);
    
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }
    
    try {
      // Parse the JSON parameters
      const parameters = JSON.parse(game.parameters) as GameParameters;
      return res.json(parameters);
    } catch (error) {
      return res.status(500).json({ message: "Invalid game parameters format" });
    }
  });

  // Get game by date
  app.get("/api/games/date/:date", async (req, res) => {
    const { date } = req.params;
    const game = await storage.getGameByDate(date);
    
    if (!game) {
      return res.status(404).json({ message: "No game found for this date" });
    }
    
    return res.json(game);
  });

  // Get all games
  app.get("/api/games", async (req, res) => {
    const games = await storage.getGames();
    return res.json(games);
  });

  // Get game by id
  app.get("/api/games/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid game ID" });
    }
    
    const game = await storage.getGame(id);
    
    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }
    
    return res.json(game);
  });

  // Get top scores for a game
  app.get("/api/scores/:gameId", async (req, res) => {
    const gameId = parseInt(req.params.gameId);
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
    
    if (isNaN(gameId)) {
      return res.status(400).json({ message: "Invalid game ID" });
    }
    
    const scores = await storage.getTopScores(gameId, limit);
    return res.json(scores);
  });

  // Submit a score
  app.post("/api/scores", async (req, res) => {
    try {
      const scoreData = insertScoreSchema.parse(req.body);
      
      // Check if the game exists
      const game = await storage.getGame(scoreData.gameId);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      
      // Check if the user exists
      const user = await storage.getUser(scoreData.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const score = await storage.createScore(scoreData);
      return res.status(201).json(score);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      return res.status(500).json({ message: "Failed to create score" });
    }
  });

  // Create a temporary "guest" user for demo purposes
  app.post("/api/users/guest", async (req, res) => {
    const username = `Guest_${Math.floor(Math.random() * 10000)}`;
    const user = await storage.createUser({
      username,
      password: "guest-password", // In a real app, you would use proper authentication
    });
    
    return res.status(201).json({ id: user.id, username: user.username });
  });
  
  // Generate a new game variation
  app.get("/api/variations/generate", async (req, res) => {
    const type = req.query.type as string || 'pacman';
    const seed = req.query.seed ? parseInt(req.query.seed as string) : undefined;
    
    const id = Math.floor(Math.random() * 1000);
    const today = new Date().toISOString().split("T")[0];
    
    const variation = generateGameVariation(id, type, today, seed);
    return res.json(variation);
  });
  
  // Get a set of sample variations (used for browsing different challenges)
  app.get("/api/variations/samples", async (req, res) => {
    const count = req.query.count ? parseInt(req.query.count as string) : 10;
    
    // Generate multiple variations (up to a max of 50)
    const sampleCount = Math.min(Math.max(count, 1), 50);
    const variations = generateMultipleVariations(sampleCount);
    
    return res.json(variations);
  });

  const httpServer = createServer(app);
  return httpServer;
}
