import { type Reminder, type InsertReminder, type User, type PushSubscription, type InsertPushSubscription, reminders, users, pushSubscriptions } from "@shared/schema";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

export interface IStorage {
  getAllReminders(userId: string): Promise<Reminder[]>;
  getReminderById(id: string): Promise<Reminder | undefined>;
  createReminder(reminder: InsertReminder): Promise<Reminder>;
  updateReminder(id: string, reminder: Partial<InsertReminder>): Promise<Reminder | undefined>;
  toggleReminderComplete(id: string): Promise<Reminder | undefined>;
  deleteReminder(id: string): Promise<boolean>;
  deleteAllReminders(userId: string): Promise<boolean>;
  
  getOrCreateUser(sessionId: string): Promise<User>;
  getUserBySessionId(sessionId: string): Promise<User | undefined>;
  updateUserName(userId: string, name: string): Promise<User | undefined>;

  createPushSubscription(subscription: InsertPushSubscription): Promise<PushSubscription>;
  getPushSubscriptionsByUserId(userId: string): Promise<PushSubscription[]>;
  deletePushSubscription(endpoint: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getAllReminders(userId: string): Promise<Reminder[]> {
    return await db.select().from(reminders).where(eq(reminders.userId, userId));
  }

  async getReminderById(id: string): Promise<Reminder | undefined> {
    const result = await db.select().from(reminders).where(eq(reminders.id, id));
    return result[0];
  }

  async createReminder(reminder: InsertReminder): Promise<Reminder> {
    const result = await db.insert(reminders).values(reminder).returning();
    return result[0];
  }

  async updateReminder(id: string, reminder: Partial<InsertReminder>): Promise<Reminder | undefined> {
    const result = await db.update(reminders)
      .set(reminder)
      .where(eq(reminders.id, id))
      .returning();
    return result[0];
  }

  async toggleReminderComplete(id: string): Promise<Reminder | undefined> {
    const existing = await this.getReminderById(id);
    if (!existing) return undefined;
    
    const result = await db.update(reminders)
      .set({ completed: !existing.completed })
      .where(eq(reminders.id, id))
      .returning();
    return result[0];
  }

  async deleteReminder(id: string): Promise<boolean> {
    const result = await db.delete(reminders).where(eq(reminders.id, id)).returning();
    return result.length > 0;
  }

  async deleteAllReminders(userId: string): Promise<boolean> {
    await db.delete(reminders).where(eq(reminders.userId, userId));
    return true;
  }

  async getOrCreateUser(sessionId: string): Promise<User> {
    let user = await this.getUserBySessionId(sessionId);
    
    if (!user) {
      const result = await db.insert(users).values({
        sessionId,
        name: 'Friend',
      }).returning();
      user = result[0];
    }
    
    return user;
  }

  async getUserBySessionId(sessionId: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.sessionId, sessionId));
    return result[0];
  }

  async updateUserName(userId: string, name: string): Promise<User | undefined> {
    const result = await db.update(users)
      .set({ name })
      .where(eq(users.id, userId))
      .returning();
    return result[0];
  }

  async createPushSubscription(subscription: InsertPushSubscription): Promise<PushSubscription> {
    const result = await db.insert(pushSubscriptions).values(subscription).returning();
    return result[0];
  }

  async getPushSubscriptionsByUserId(userId: string): Promise<PushSubscription[]> {
    return await db.select().from(pushSubscriptions).where(eq(pushSubscriptions.userId, userId));
  }

  async deletePushSubscription(endpoint: string): Promise<boolean> {
    const result = await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint)).returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
