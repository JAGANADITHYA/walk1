import {
  users,
  walkSessions,
  transactions,
  metroTickets,
  rewardRedemptions,
  type User,
  type UpsertUser,
  type WalkSession,
  type InsertWalkSession,
  type Transaction,
  type InsertTransaction,
  type MetroTicket,
  type InsertMetroTicket,
  type RewardRedemption,
  type InsertRewardRedemption,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lt } from "drizzle-orm";
import { nanoid } from "nanoid";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserBalance(userId: string, amount: number): Promise<void>;
  
  // Walk session operations
  createWalkSession(session: InsertWalkSession): Promise<WalkSession>;
  getWalkSession(id: string): Promise<WalkSession | undefined>;
  updateWalkSession(id: string, updates: Partial<WalkSession>): Promise<WalkSession>;
  getUserWalkSessions(userId: string, limit?: number): Promise<WalkSession[]>;
  
  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getUserTransactions(userId: string, limit?: number): Promise<Transaction[]>;
  
  // Metro ticket operations
  createMetroTicket(ticket: InsertMetroTicket): Promise<MetroTicket>;
  getMetroTickets(userId: string): Promise<MetroTicket[]>;
  
  // Reward redemption operations
  createRewardRedemption(redemption: InsertRewardRedemption): Promise<RewardRedemption>;
  getRewardRedemptions(userId: string): Promise<RewardRedemption[]>;
  
  // Dashboard data
  getUserDashboardData(userId: string): Promise<{
    todaySteps: number;
    todayDistance: number;
    todayEarnings: number;
    monthlyEarnings: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async createWalkSession(sessionData: InsertWalkSession): Promise<WalkSession> {
    const [session] = await db
      .insert(walkSessions)
      .values({
        ...sessionData,
        id: nanoid(),
      })
      .returning();
    return session;
  }

  async getWalkSession(id: string): Promise<WalkSession | undefined> {
    const [session] = await db
      .select()
      .from(walkSessions)
      .where(eq(walkSessions.id, id));
    return session;
  }

  async updateWalkSession(id: string, updates: Partial<WalkSession>): Promise<WalkSession> {
    const [session] = await db
      .update(walkSessions)
      .set(updates)
      .where(eq(walkSessions.id, id))
      .returning();
    return session;
  }

  async getUserWalkSessions(userId: string, limit = 10): Promise<WalkSession[]> {
    return await db
      .select()
      .from(walkSessions)
      .where(eq(walkSessions.userId, userId))
      .orderBy(desc(walkSessions.createdAt))
      .limit(limit);
  }

  async createTransaction(transactionData: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values({
        ...transactionData,
        id: nanoid(),
      })
      .returning();
    return transaction;
  }

  async getUserTransactions(userId: string, limit = 20): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt))
      .limit(limit);
  }

  async getUserDashboardData(userId: string): Promise<{
    todaySteps: number;
    todayDistance: number;
    todayEarnings: number;
    monthlyEarnings: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    // Get today's completed walks
    const todayWalks = await db
      .select()
      .from(walkSessions)
      .where(
        and(
          eq(walkSessions.userId, userId),
          eq(walkSessions.completed, true),
          gte(walkSessions.createdAt, today),
          lt(walkSessions.createdAt, tomorrow)
        )
      );

    // Get monthly transactions
    const monthlyTransactions = await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.type, "earning"),
          gte(transactions.createdAt, monthStart),
          lt(transactions.createdAt, monthEnd)
        )
      );

    const todaySteps = todayWalks.reduce((sum, walk) => sum + (walk.steps || 0), 0);
    const todayDistance = todayWalks.reduce((sum, walk) => sum + parseFloat(walk.distance || "0"), 0);
    const todayEarnings = todayWalks.reduce((sum, walk) => sum + parseFloat(walk.earnings || "0"), 0);
    const monthlyEarnings = monthlyTransactions.reduce((sum, tx) => sum + parseFloat(tx.amount), 0);

    return {
      todaySteps,
      todayDistance,
      todayEarnings,
      monthlyEarnings,
    };
  }

  async updateUserBalance(userId: string, amount: number): Promise<void> {
    const user = await this.getUser(userId);
    if (user) {
      const newBalance = (parseFloat(user.balance || "0") + amount).toString();
      await db
        .update(users)
        .set({ balance: newBalance, updatedAt: new Date() })
        .where(eq(users.id, userId));
    }
  }

  async createMetroTicket(ticketData: InsertMetroTicket): Promise<MetroTicket> {
    const [ticket] = await db
      .insert(metroTickets)
      .values({
        ...ticketData,
        id: nanoid(),
      })
      .returning();
    return ticket;
  }

  async getMetroTickets(userId: string): Promise<MetroTicket[]> {
    return await db
      .select()
      .from(metroTickets)
      .where(eq(metroTickets.userId, userId))
      .orderBy(desc(metroTickets.createdAt));
  }

  async createRewardRedemption(redemptionData: InsertRewardRedemption): Promise<RewardRedemption> {
    const [redemption] = await db
      .insert(rewardRedemptions)
      .values({
        ...redemptionData,
        id: nanoid(),
      })
      .returning();
    return redemption;
  }

  async getRewardRedemptions(userId: string): Promise<RewardRedemption[]> {
    return await db
      .select()
      .from(rewardRedemptions)
      .where(eq(rewardRedemptions.userId, userId))
      .orderBy(desc(rewardRedemptions.createdAt));
  }
}

export const storage = new DatabaseStorage();
