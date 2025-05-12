import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, hashPassword } from "./auth";
import axios from "axios";
import { z } from "zod";
import { insertMessageSchema, messages, User } from "@shared/schema";
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
      const subtrairQuantidade = response.data.subtrair ? Number(response.data.subtrair) : 0;

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

      // Só desconta mensagens se o parâmetro subtrair estiver presente na resposta
      if (subtrairQuantidade > 0) {
        // Descontar a quantidade especificada de mensagens disponíveis
        const novaQuantidade = Math.max(0, user.responses_available - subtrairQuantidade);
        await storage.updateUser(user.id, {
          responses_available: novaQuantidade
        });
      }

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
  
  // Atualiza créditos e verifica status de pagamento (executado diariamente por um cron job)
  app.post("/api/check-payment-status", async (req, res) => {
    try {
      // Obter todos os usuários
      const users = await storage.getAllUsers();
      
      // Para cada usuário, verificar o status de pagamento
      const updatedUsers = await Promise.all(users.map(async (user: User) => {
        const hoje = new Date();
        
        // Data de referência para renovação
        const dataBase = user.tier_id === 4  // 4 = plano free
          ? new Date(user.created_at || hoje) // plano free: baseado na data de cadastro
          : new Date(user.last_payment_date || hoje); // outros planos: baseado na data do último pagamento
        
        // Calcular dias decorridos desde o último pagamento
        const diffTime = hoje.getTime() - dataBase.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // Verificar se está atrasado (mais de 33 dias)
        const novoStatus = diffDays > 33 ? "atrasado" : "em_dia";
        
        // Verificar se é momento de renovar créditos (a cada 30 dias)
        let renovado = false;
        if (diffDays >= 30 && diffDays < 33 && user.payment_status === "em_dia") {
          // Obter informações do plano
          const tier = await storage.getTierById(user.tier_id);
          
          if (tier) {
            // Renovar créditos conforme o plano
            await storage.updateUser(user.id, {
              responses_available: tier.responses_limit
            });
            renovado = true;
          }
        }
        
        // Atualizar status de pagamento se necessário
        if (novoStatus !== user.payment_status) {
          await storage.updateUser(user.id, { payment_status: novoStatus });
        }
        
        return { ...user, payment_status: novoStatus, renovado };
      }));
      
      res.json({ 
        message: "Status de pagamento verificado com sucesso", 
        updatedUsers: updatedUsers.length
      });
    } catch (error) {
      console.error("Erro ao verificar status de pagamento:", error);
      res.status(500).json({ message: "Erro ao verificar status de pagamento" });
    }
  });
  
  // Atualiza data do último pagamento (usado por sistema externo)
  app.post("/api/update-payment", async (req, res) => {
    try {
      const { user_id, credits } = req.body;
      
      if (!user_id || !credits) {
        return res.status(400).json({ message: "ID de usuário e créditos são obrigatórios" });
      }
      
      // Atualizar data de pagamento e status
      const hoje = new Date();
      const user = await storage.updateUser(user_id, {
        last_payment_date: hoje,
        payment_status: "em_dia",
        responses_available: credits
      });
      
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      
      res.json({ 
        message: "Pagamento atualizado com sucesso", 
        user 
      });
    } catch (error) {
      console.error("Erro ao atualizar pagamento:", error);
      res.status(500).json({ message: "Erro ao atualizar pagamento" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
