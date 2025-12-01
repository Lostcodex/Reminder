import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { insertReminderSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Get all reminders
  app.get("/api/reminders", async (req, res) => {
    try {
      const reminders = await storage.getAllReminders();
      res.json(reminders);
    } catch (error) {
      console.error("Error fetching reminders:", error);
      res.status(500).json({ error: "Failed to fetch reminders" });
    }
  });

  // Create reminder
  app.post("/api/reminders", async (req, res) => {
    try {
      const validated = insertReminderSchema.parse(req.body);
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
      await storage.deleteAllReminders();
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting all reminders:", error);
      res.status(500).json({ error: "Failed to delete all reminders" });
    }
  });

  return httpServer;
}
