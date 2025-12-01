import { type Reminder, type InsertReminder, reminders } from "@shared/schema";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

export interface IStorage {
  // Reminder CRUD
  getAllReminders(): Promise<Reminder[]>;
  getReminderById(id: string): Promise<Reminder | undefined>;
  createReminder(reminder: InsertReminder): Promise<Reminder>;
  updateReminder(id: string, reminder: Partial<InsertReminder>): Promise<Reminder | undefined>;
  deleteReminder(id: string): Promise<boolean>;
  toggleReminderComplete(id: string): Promise<Reminder | undefined>;
  deleteAllReminders(): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getAllReminders(): Promise<Reminder[]> {
    return await db.select().from(reminders);
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

  async deleteReminder(id: string): Promise<boolean> {
    const result = await db.delete(reminders).where(eq(reminders.id, id)).returning();
    return result.length > 0;
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

  async deleteAllReminders(): Promise<boolean> {
    await db.delete(reminders);
    return true;
  }
}

export const storage = new DatabaseStorage();
