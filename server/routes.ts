import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { insertReminderSchema, registerSchema, loginSchema } from "@shared/schema";
import { z } from "zod";
import { hashPassword, verifyPassword, generateToken, verifyToken } from "./auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Middleware to attach user from JWT token
  app.use((req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.replace('Bearer ', '');
    
    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        (req as any).userId = decoded.userId;
      }
    }
    next();
  });

  // Register
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password, name } = registerSchema.parse(req.body);
      
      const existing = await storage.getUserByUsername(username);
      if (existing) {
        return res.status(400).json({ error: "Username already taken" });
      }

      const passwordHash = await hashPassword(password);
      const user = await storage.registerUser(username, passwordHash, name);
      const token = generateToken(user.id);
      
      res.status(201).json({ 
        user: { id: user.id, username: user.username, name: user.name },
        token 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error("Error registering user:", error);
      res.status(500).json({ error: "Failed to register" });
    }
  });

  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      const passwordValid = await verifyPassword(password, user.passwordHash);
      if (!passwordValid) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      const token = generateToken(user.id);
      res.json({ 
        user: { id: user.id, username: user.username, name: user.name },
        token 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error("Error logging in:", error);
      res.status(500).json({ error: "Failed to login" });
    }
  });

  // Get user profile
  app.get("/api/user/profile", async (req, res) => {
    try {
      const userId = (req as any).userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ id: user.id, username: user.username, name: user.name });
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  // Update user name
  app.patch("/api/user/profile", async (req, res) => {
    try {
      const userId = (req as any).userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const { name } = req.body;
      if (!name || typeof name !== 'string') {
        return res.status(400).json({ error: "Valid name required" });
      }

      const updated = await storage.updateUserName(user.id, name);
      res.json({ id: updated?.id, username: user.username, name: updated?.name });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // Get all reminders for user
  app.get("/api/reminders", async (req, res) => {
    try {
      const userId = (req as any).userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const reminders = await storage.getAllReminders(userId);
      res.json(reminders);
    } catch (error) {
      console.error("Error fetching reminders:", error);
      res.status(500).json({ error: "Failed to fetch reminders" });
    }
  });

  // Create reminder
  app.post("/api/reminders", async (req, res) => {
    try {
      const userId = (req as any).userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const validated = insertReminderSchema.parse({ ...req.body, userId });
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

  // Update reminder
  app.patch("/api/reminders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validated = insertReminderSchema.partial().parse(req.body);
      const reminder = await storage.updateReminder(id, validated);
      if (!reminder) {
        return res.status(404).json({ error: "Reminder not found" });
      }
      res.json(reminder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid reminder data", details: error.errors });
      }
      console.error("Error updating reminder:", error);
      res.status(500).json({ error: "Failed to update reminder" });
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
      const userId = (req as any).userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      await storage.deleteAllReminders(userId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting all reminders:", error);
      res.status(500).json({ error: "Failed to delete all reminders" });
    }
  });

  // Get VAPID public key
  app.get("/api/push/vapid-public-key", (req, res) => {
    const publicKey = process.env.VAPID_PUBLIC_KEY;
    if (!publicKey) {
      return res.status(500).json({ error: "VAPID public key not configured" });
    }
    res.json({ publicKey });
  });

  // Subscribe to push notifications
  app.post("/api/push/subscribe", async (req, res) => {
    try {
      const userId = (req as any).userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { endpoint, auth, p256dh } = req.body;
      if (!endpoint || !auth || !p256dh) {
        return res.status(400).json({ error: "Missing subscription details" });
      }

      await storage.createPushSubscription({
        userId,
        endpoint,
        auth,
        p256dh,
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error subscribing to push:", error);
      res.status(500).json({ error: "Failed to subscribe to push" });
    }
  });

  // Unsubscribe from push notifications
  app.post("/api/push/unsubscribe", async (req, res) => {
    try {
      const { endpoint } = req.body;
      if (!endpoint) {
        return res.status(400).json({ error: "Endpoint required" });
      }

      await storage.deletePushSubscription(endpoint);
      res.json({ success: true });
    } catch (error) {
      console.error("Error unsubscribing from push:", error);
      res.status(500).json({ error: "Failed to unsubscribe from push" });
    }
  });

  return httpServer;
}
