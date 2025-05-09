import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, hashPassword } from "./auth";
import axios from "axios";
import { z } from "zod";
import { insertMessageSchema, messages } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Get lists/categories of IAs
  app.get("/api/lists", async (req, res) => {
    try {
      const lists = await storage.getLists();
      res.json(lists);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar listas" });
    }
  });

  // Get user's messages for a specific list
  app.get("/api/messages/:listId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      const listId = parseInt(req.params.listId);
      if (isNaN(listId)) {
        return res.status(400).json({ message: "ID de lista inválido" });
      }

      const messages = await storage.getMessagesByUserAndList(req.user.id, listId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar mensagens" });
    }
  });

  // Send message to AI
  app.post("/api/messages", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    try {
      // Get current user
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      // Check if user has available responses
      if (user.responses_available <= 0) {
        return res.status(403).json({ message: "Sem respostas disponíveis" });
      }

      // Validate request
      const messageSchema = insertMessageSchema.parse(req.body);
      const { content, lista_id } = messageSchema;

      // Send to external API
      const response = await axios.post('https://fl.libx.com.br/webhook-test/8391ddd1-64c2-4347-b8f6-6784a31242353', {
        message: content,
        user_id: user.id,
        lista_id
      });

      if (response.status !== 200) {
        return res.status(500).json({ message: "Erro ao obter resposta da IA" });
      }

      // Get AI response
      const aiResponse = response.data.output;

      // Save message and AI response
      const message = await storage.createMessage({
        user_id: user.id,
        lista_id,
        content
      });

      // Update the message with AI response
      const updatedMessage = await db.update(messages)
        .set({ ai_response: aiResponse })
        .where(eq(messages.id, message.id))
        .returning();

      // Decrement available responses
      await storage.updateUser(user.id, {
        responses_available: user.responses_available - 1
      });

      // Return complete conversation
      res.status(201).json({
        userMessage: message,
        aiResponse
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao enviar mensagem" });
    }
  });

  // Get subscription tiers
  app.get("/api/tiers", async (req, res) => {
    try {
      const tiers = await storage.getTiers();
      res.json(tiers);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar planos" });
    }
  });

  // Get checklist items for subscription plans
  app.get("/api/checklist-planos", async (req, res) => {
    try {
      const items = await storage.getChecklistItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar itens do checklist" });
    }
  });

  // Get active partners
  app.get("/api/partners", async (req, res) => {
    try {
      const partners = await storage.getActivePartners();
      res.json(partners);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar parceiros" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
