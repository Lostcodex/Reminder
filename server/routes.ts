import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { insertReminderSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Middleware to attach user from session
  app.use((req, res, next) => {
    const sessionId = req.headers['x-session-id'] as string;
    (req as any).sessionId = sessionId;
    next();
  });

  // Get or create user
  app.post("/api/auth/init", async (req, res) => {
    try {
      const sessionId = (req as any).sessionId;
      if (!sessionId) {
        return res.status(400).json({ error: "Session ID required" });
      }
      const user = await storage.getOrCreateUser(sessionId);
      res.json(user);
    } catch (error) {
      console.error("Error initializing user:", error);
      res.status(500).json({ error: "Failed to initialize user" });
    }
  });

  // Get user profile
  app.get("/api/user/profile", async (req, res) => {
    try {
      const sessionId = (req as any).sessionId;
      if (!sessionId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUserBySessionId(sessionId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  // Update user name
  app.patch("/api/user/profile", async (req, res) => {
    try {
      const sessionId = (req as any).sessionId;
      if (!sessionId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const user = await storage.getUserBySessionId(sessionId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const { name } = req.body;
      if (!name || typeof name !== 'string') {
        return res.status(400).json({ error: "Valid name required" });
      }

      const updated = await storage.updateUserName(user.id, name);
      res.json(updated);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // Get all reminders for user
  app.get("/api/reminders", async (req, res) => {
    try {
      const user = await storage.getUserBySessionId((req as any).sessionId);
      if (!user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const reminders = await storage.getAllReminders(user.id);
      res.json(reminders);
    } catch (error) {
      console.error("Error fetching reminders:", error);
      res.status(500).json({ error: "Failed to fetch reminders" });
    }
  });

  // Create reminder
  app.post("/api/reminders", async (req, res) => {
    try {
      const user = await storage.getUserBySessionId((req as any).sessionId);
      if (!user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const validated = insertReminderSchema.parse({ ...req.body, userId: user.id });
      const reminder = await storage.createReminder(validated);
      res.status(201).json(reminder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid reminder data", details: error.errors });
      }
      console.error("Error creating reminder:", error);
      res.status(500).json({ error: "Failed to create reminder" });
    }
  });

  // Toggle reminder completion
  app.patch("/api/reminders/:id/toggle", async (req, res) => {
    try {
      const { id } = req.params;
      const reminder = await storage.toggleReminderComplete(id);
      if (!reminder) {
        return res.status(404).json({ error: "Reminder not found" });
      }
      res.json(reminder);
    } catch (error) {
      console.error("Error toggling reminder:", error);
      res.status(500).json({ error: "Failed to toggle reminder" });
    }
  });

  // Delete reminder
  app.delete("/api/reminders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteReminder(id);
      if (!deleted) {
        return res.status(404).json({ error: "Reminder not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting reminder:", error);
      res.status(500).json({ error: "Failed to delete reminder" });
    }
  });

  // Delete all reminders
  app.delete("/api/reminders", async (req, res) => {
    try {
      const user = await storage.getUserBySessionId((req as any).sessionId);
      if (!user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      await storage.deleteAllReminders(user.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting all reminders:", error);
      res.status(500).json({ error: "Failed to delete all reminders" });
    }
  });

  return httpServer;
}
