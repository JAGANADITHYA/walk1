import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertWalkSessionSchema, insertTransactionSchema } from "@shared/schema";
import { nanoid } from "nanoid";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard data
  app.get('/api/dashboard', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const dashboardData = await storage.getUserDashboardData(userId);
      
      res.json({
        user,
        ...dashboardData,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Walk session routes
  app.post('/api/walks/start', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessionData = insertWalkSessionSchema.parse({
        ...req.body,
        userId,
        startTime: new Date(),
      });

      const session = await storage.createWalkSession(sessionData);
      res.json(session);
    } catch (error) {
      console.error("Error starting walk session:", error);
      res.status(500).json({ message: "Failed to start walk session" });
    }
  });

  app.put('/api/walks/:id/complete', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessionId = req.params.id;
      const { steps, distance } = req.body;

      const session = await storage.getWalkSession(sessionId);
      if (!session || session.userId !== userId) {
        return res.status(404).json({ message: "Walk session not found" });
      }

      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - session.startTime.getTime()) / (1000 * 60));
      
      // Calculate earnings based on steps and duration
      const baseRate = 0.01; // ₹0.01 per step
      const timeBonus = duration >= 30 ? 5 : 0; // ₹5 bonus for completing 30 minutes
      const earnings = (steps * baseRate) + timeBonus;

      const updatedSession = await storage.updateWalkSession(sessionId, {
        endTime,
        duration,
        steps,
        distance: distance.toString(),
        earnings: earnings.toString(),
        completed: true,
      });

      // Create earning transaction
      await storage.createTransaction({
        userId,
        type: "earning",
        amount: earnings.toString(),
        description: `30-min Walk Reward - ${steps} steps`,
        relatedWalkId: sessionId,
      });

      // Update user's total stats and balance
      const user = await storage.getUser(userId);
      if (user) {
        await storage.upsertUser({
          ...user,
          balance: (parseFloat(user.balance || "0") + earnings).toString(),
          totalSteps: (user.totalSteps || 0) + steps,
          totalDistance: (parseFloat(user.totalDistance || "0") + parseFloat(distance.toString())).toString(),
          totalEarnings: (parseFloat(user.totalEarnings || "0") + earnings).toString(),
          lastWalkDate: endTime,
          dailyStreak: (user.dailyStreak || 0) + 1,
        });
      }

      res.json(updatedSession);
    } catch (error) {
      console.error("Error completing walk session:", error);
      res.status(500).json({ message: "Failed to complete walk session" });
    }
  });

  app.get('/api/walks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessions = await storage.getUserWalkSessions(userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching walk sessions:", error);
      res.status(500).json({ message: "Failed to fetch walk sessions" });
    }
  });

  // Transaction routes
  app.get('/api/transactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactions = await storage.getUserTransactions(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Daily streak bonus
  app.post('/api/bonus/streak', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const today = new Date().toDateString();
      const lastWalk = user.lastWalkDate ? new Date(user.lastWalkDate).toDateString() : null;
      
      if (lastWalk === today) {
        const bonusAmount = 5; // ₹5 daily bonus
        
        await storage.createTransaction({
          userId,
          type: "bonus",
          amount: bonusAmount.toString(),
          description: "Daily Streak Bonus",
        });

        await storage.upsertUser({
          ...user,
          balance: (parseFloat(user.balance || "0") + bonusAmount).toString(),
        });

        res.json({ message: "Daily streak bonus awarded", amount: bonusAmount });
      } else {
        res.json({ message: "No bonus available today" });
      }
    } catch (error) {
      console.error("Error processing streak bonus:", error);
      res.status(500).json({ message: "Failed to process streak bonus" });
    }
  });

  // Metro ticket routes
  app.get("/api/metro/tickets", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tickets = await storage.getMetroTickets(userId);
      res.json(tickets);
    } catch (error) {
      console.error("Error fetching metro tickets:", error);
      res.status(500).json({ message: "Failed to fetch metro tickets" });
    }
  });

  app.post("/api/metro/purchase", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { fromStation, toStation, ticketType, totalAmount, coinsUsed } = req.body;
      
      // Validate user has enough balance
      const user = await storage.getUser(userId);
      if (!user || parseFloat(user.balance || "0") < coinsUsed) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      // Create metro ticket
      const ticket = await storage.createMetroTicket({
        userId,
        fromStation,
        toStation,
        ticketType,
        totalAmount: totalAmount.toString(),
        coinsUsed: coinsUsed.toString(),
        cashAmount: (totalAmount - coinsUsed).toString(),
        qrCode: `METRO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      });

      // Update user balance and create transaction
      await storage.updateUserBalance(userId, -coinsUsed);
      await storage.createTransaction({
        userId,
        type: "metro_payment",
        amount: (-coinsUsed).toString(),
        description: `Metro ticket: ${fromStation} → ${toStation}`,
        metadata: JSON.stringify({ ticketId: ticket.id, ticketType })
      });

      res.json(ticket);
    } catch (error) {
      console.error("Error purchasing metro ticket:", error);
      res.status(500).json({ message: "Failed to purchase metro ticket" });
    }
  });

  // Rewards routes
  app.get("/api/rewards/redemptions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const redemptions = await storage.getRewardRedemptions(userId);
      res.json(redemptions);
    } catch (error) {
      console.error("Error fetching reward redemptions:", error);
      res.status(500).json({ message: "Failed to fetch reward redemptions" });
    }
  });

  app.post("/api/rewards/redeem", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { rewardType, provider, originalPrice, discountAmount, finalPrice, coinsUsed, metadata } = req.body;
      
      // Validate user has enough balance
      const user = await storage.getUser(userId);
      if (!user || parseFloat(user.balance || "0") < coinsUsed) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      // Create reward redemption
      const redemption = await storage.createRewardRedemption({
        userId,
        rewardType,
        provider,
        originalPrice: originalPrice.toString(),
        discountAmount: discountAmount.toString(),
        finalPrice: finalPrice.toString(),
        coinsUsed: coinsUsed.toString(),
        redemptionCode: `RWD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        metadata
      });

      // Update user balance and create transaction
      await storage.updateUserBalance(userId, -coinsUsed);
      await storage.createTransaction({
        userId,
        type: "reward_redemption",
        amount: (-coinsUsed).toString(),
        description: `Reward: ${provider} ${rewardType.replace('_', ' ')}`,
        metadata: JSON.stringify({ redemptionId: redemption.id, provider, rewardType })
      });

      res.json(redemption);
    } catch (error) {
      console.error("Error redeeming reward:", error);
      res.status(500).json({ message: "Failed to redeem reward" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
