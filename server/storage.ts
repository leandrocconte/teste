import { 
  User, InsertUser, List, Tier, Message, InsertMessage, Parceiro,
  ChecklistPlano, users, lists, tiers, messages, parceiros, checklistPlanos
} from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";
import { randomBytes } from "crypto";
import { v4 as uuidv4 } from "uuid";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(userId: number, userData: Partial<User>): Promise<User | undefined>;
  
  // Password reset methods
  createPasswordResetToken(email: string): Promise<string | undefined>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  resetPassword(token: string, newPassword: string): Promise<boolean>;
  
  // Lists/Categories methods
  getLists(): Promise<List[]>;
  getListById(id: number): Promise<List | undefined>;
  
  // Message methods
  getMessagesByUserAndList(userId: number, listId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Subscription tier methods
  getTiers(): Promise<Tier[]>;
  getTierById(id: number): Promise<Tier | undefined>;
  
  // Checklist items
  getChecklistItems(): Promise<ChecklistPlano[]>;
  
  // Partners
  getActivePartners(): Promise<Parceiro[]>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private lists: Map<number, List>;
  private messages: Map<number, Message>;
  private tiers: Map<number, Tier>;
  private checklistPlanos: Map<number, ChecklistPlano>;
  private parceiros: Map<number, Parceiro>;
  private currentIds: {
    users: number;
    messages: number;
  };
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.lists = new Map();
    this.messages = new Map();
    this.tiers = new Map();
    this.checklistPlanos = new Map();
    this.parceiros = new Map();
    
    this.currentIds = {
      users: 1,
      messages: 1,
    };
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24h
    });
    
    // Initialize with sample data
    this.initSampleData();
  }

  private initSampleData() {
    // Add sample lists
    this.lists.set(1, {
      id: 1,
      title: "Biomecânica",
      description: "Obtenha análises detalhadas sobre movimento, postura e técnicas para performance física e prevenção de lesões.",
      image_url: "https://images.unsplash.com/photo-1576678927484-cc907957088c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
      tag: "Assistente Especializado",
    });
    
    this.lists.set(2, {
      id: 2,
      title: "Postagens para Instagram",
      description: "Crie conteúdo envolvente, legendas criativas e estratégias de hashtag para aumentar seu alcance no Instagram.",
      image_url: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
      tag: "Assistente Criativo",
    });
    
    // Add subscription tiers
    this.tiers.set(4, {
      tier_id: 4,
      titulo: "Free",
      responses_limit: 20,
      valor: 0,
      link: "https://example.com/checkout?plan=free",
      check1: "sim",
      check2: "sim",
      check3: "não",
    });
    
    this.tiers.set(1, {
      tier_id: 1,
      titulo: "Básico",
      responses_limit: 200,
      valor: 1190, // R$ 11,90
      link: "https://example.com/checkout?plan=basic",
      check1: "sim",
      check2: "sim",
      check3: "sim",
    });
    
    this.tiers.set(2, {
      tier_id: 2,
      titulo: "Pro",
      responses_limit: 400,
      valor: 1690, // R$ 16,90
      link: "https://example.com/checkout?plan=pro",
      check1: "sim",
      check2: "sim",
      check3: "sim",
    });
    
    this.tiers.set(3, {
      tier_id: 3,
      titulo: "Premium",
      responses_limit: 1000,
      valor: 2690, // R$ 26,90
      link: "https://example.com/checkout?plan=premium",
      check1: "sim",
      check2: "sim",
      check3: "sim",
    });
    
    // Add checklist items
    this.checklistPlanos.set(1, {
      id: 1,
      descricao: "Acesso a todos os assistentes",
    });
    
    this.checklistPlanos.set(2, {
      id: 2,
      descricao: "Histórico de conversas",
    });
    
    this.checklistPlanos.set(3, {
      id: 3,
      descricao: "Suporte prioritário",
    });
    
    // Add partner companies
    this.parceiros.set(1, {
      id: 1,
      name: "SupremeNutrition",
      description: "Desconto exclusivo em suplementos para performance e recuperação. Código promocional automático no checkout.",
      discount: "20% OFF",
      valid_until: "30/12/2023",
      image_url: "https://images.unsplash.com/photo-1607962837359-5e7e89f86776?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
      link: "https://parceiro1.com.br/promo",
      ativo: true
    });
    
    this.parceiros.set(2, {
      id: 2,
      name: "SocialBoost Pro",
      description: "Plataforma completa para gerenciamento e crescimento de redes sociais com trial estendido exclusivo.",
      discount: "7 DIAS GRÁTIS",
      valid_until: "+ 30% desconto no primeiro mês",
      image_url: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
      link: "https://parceiro2.com.br/promo",
      ativo: true
    });
    
    this.parceiros.set(3, {
      id: 3,
      name: "EduLearn Academy",
      description: "Cursos online de biomecânica, treinamento e marketing digital para redes sociais com desconto especial.",
      discount: "40% OFF",
      valid_until: "Em todos os cursos premium",
      image_url: "https://images.unsplash.com/photo-1599658880436-c61792e70672?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
      link: "https://parceiro3.com.br/promo",
      ativo: true
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.currentIds.users++;
    
    const user: User = { 
      ...userData, 
      id,
      verified: false,
      reset_token: null,
      reset_token_expires: null,
      responses_available: 20,
      tier_id: 4,
    };
    
    this.users.set(id, user);
    return user;
  }

  async updateUser(userId: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Password reset methods
  async createPasswordResetToken(email: string): Promise<string | undefined> {
    const user = await this.getUserByEmail(email);
    if (!user) return undefined;
    
    const resetToken = randomBytes(20).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour
    
    await this.updateUser(user.id, {
      reset_token: resetToken,
      reset_token_expires: resetTokenExpires
    });
    
    return resetToken;
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.reset_token === token && user.reset_token_expires > new Date()
    );
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const user = await this.getUserByResetToken(token);
    if (!user) return false;
    
    await this.updateUser(user.id, {
      password: newPassword,
      reset_token: null,
      reset_token_expires: null
    });
    
    return true;
  }

  // Lists/Categories methods
  async getLists(): Promise<List[]> {
    return Array.from(this.lists.values());
  }

  async getListById(id: number): Promise<List | undefined> {
    return this.lists.get(id);
  }

  // Message methods
  async getMessagesByUserAndList(userId: number, listId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.user_id === userId && message.lista_id === listId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  async createMessage(messageData: InsertMessage): Promise<Message> {
    const id = this.currentIds.messages++;
    const now = new Date();
    
    const message: Message = {
      ...messageData,
      id,
      ai_response: null,
      created_at: now
    };
    
    this.messages.set(id, message);
    return message;
  }

  // Subscription methods
  async getTiers(): Promise<Tier[]> {
    return Array.from(this.tiers.values()).sort((a, b) => a.tier_id - b.tier_id);
  }

  async getTierById(id: number): Promise<Tier | undefined> {
    return this.tiers.get(id);
  }

  // Checklist methods
  async getChecklistItems(): Promise<ChecklistPlano[]> {
    return Array.from(this.checklistPlanos.values());
  }

  // Partners methods
  async getActivePartners(): Promise<Parceiro[]> {
    return Array.from(this.parceiros.values()).filter(parceiro => parceiro.ativo);
  }
}

export const storage = new MemStorage();
