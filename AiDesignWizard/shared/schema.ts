import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  decimal,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0.00"),
  dailyStreak: integer("daily_streak").default(0),
  lastWalkDate: timestamp("last_walk_date"),
  totalSteps: integer("total_steps").default(0),
  totalDistance: decimal("total_distance", { precision: 10, scale: 2 }).default("0.00"),
  totalEarnings: decimal("total_earnings", { precision: 10, scale: 2 }).default("0.00"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Brand configuration table for customizable themes and branding
export const brandConfigs = pgTable("brand_configs", {
  id: varchar("id").primaryKey().notNull(),
  name: varchar("name").notNull(),
  logoUrl: varchar("logo_url"),
  primaryColor: varchar("primary_color").default("#00FF00"),
  accentColor: varchar("accent_color").default("#FFD700"),
  backgroundType: varchar("background_type", { enum: ["rainbow", "gradient", "video", "image"] }).default("rainbow"),
  backgroundUrl: varchar("background_url"), // For video/image backgrounds
  customCss: text("custom_css"),
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Ad placement configuration
export const adPlacements = pgTable("ad_placements", {
  id: varchar("id").primaryKey().notNull(),
  brandConfigId: varchar("brand_config_id").references(() => brandConfigs.id),
  placement: varchar("placement", { enum: ["top_banner", "bottom_banner", "side_left", "side_right", "fullscreen", "overlay"] }).notNull(),
  contentUrl: varchar("content_url"),
  contentType: varchar("content_type", { enum: ["image", "video", "html"] }).notNull(),
  width: integer("width"),
  height: integer("height"),
  opacity: decimal("opacity", { precision: 3, scale: 2 }).default("1.00"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const walkSessions = pgTable("walk_sessions", {
  id: varchar("id").primaryKey().notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  duration: integer("duration"), // in minutes
  steps: integer("steps").default(0),
  distance: decimal("distance", { precision: 10, scale: 2 }).default("0.00"),
  earnings: decimal("earnings", { precision: 10, scale: 2 }).default("0.00"),
  completed: boolean("completed").default(false),
  startLocation: text("start_location"), // JSON string
  endLocation: text("end_location"), // JSON string
  createdAt: timestamp("created_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: varchar("type", { enum: ["earning", "redemption", "bonus", "metro_payment", "reward_redemption"] }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  relatedWalkId: varchar("related_walk_id").references(() => walkSessions.id),
  metadata: text("metadata"), // JSON string for additional data
  createdAt: timestamp("created_at").defaultNow(),
});

export const metroTickets = pgTable("metro_tickets", {
  id: varchar("id").primaryKey().notNull(),
  userId: varchar("user_id").notNull().references(() => users.id),
  fromStation: varchar("from_station").notNull(),
  toStation: varchar("to_station").notNull(),
  ticketType: varchar("ticket_type", { enum: ["single", "return", "day_pass"] }).notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  coinsUsed: decimal("coins_used", { precision: 10, scale: 2 }).notNull(),
  cashAmount: decimal("cash_amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { enum: ["active", "used", "expired"] }).notNull().default('active'),
  qrCode: text("qr_code"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const rewardRedemptions = pgTable("reward_redemptions", {
  id: varchar("id").primaryKey().notNull(),
  userId: varchar("user_id").notNull().references(() => users.id),
  rewardType: varchar("reward_type", { enum: ["spotify", "movie_ticket", "ott_subscription"] }).notNull(),
  provider: varchar("provider").notNull(), // 'spotify', 'bookmyshow', 'netflix', 'prime', etc.
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }).notNull(),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).notNull(),
  finalPrice: decimal("final_price", { precision: 10, scale: 2 }).notNull(),
  coinsUsed: decimal("coins_used", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { enum: ["pending", "confirmed", "delivered"] }).notNull().default('pending'),
  redemptionCode: varchar("redemption_code"),
  metadata: text("metadata"), // JSON string for additional details
  createdAt: timestamp("created_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertWalkSessionSchema = createInsertSchema(walkSessions).omit({
  id: true,
  createdAt: true,
});
export type InsertWalkSession = z.infer<typeof insertWalkSessionSchema>;
export type WalkSession = typeof walkSessions.$inferSelect;

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export const insertBrandConfigSchema = createInsertSchema(brandConfigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertBrandConfig = z.infer<typeof insertBrandConfigSchema>;
export type BrandConfig = typeof brandConfigs.$inferSelect;

export const insertAdPlacementSchema = createInsertSchema(adPlacements).omit({
  id: true,
  createdAt: true,
});
export type InsertAdPlacement = z.infer<typeof insertAdPlacementSchema>;
export type AdPlacement = typeof adPlacements.$inferSelect;

export const insertMetroTicketSchema = createInsertSchema(metroTickets).omit({
  id: true,
  createdAt: true,
});
export type InsertMetroTicket = z.infer<typeof insertMetroTicketSchema>;
export type MetroTicket = typeof metroTickets.$inferSelect;

export const insertRewardRedemptionSchema = createInsertSchema(rewardRedemptions).omit({
  id: true,
  createdAt: true,
});
export type InsertRewardRedemption = z.infer<typeof insertRewardRedemptionSchema>;
export type RewardRedemption = typeof rewardRedemptions.$inferSelect;
