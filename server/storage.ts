import { 
  User, InsertUser, List, Tier, Message, InsertMessage, Parceiro,
  ChecklistPlano, users, lists, tiers, messages, parceiros, checklistPlanos
} from "@shared/schema";
import session from "express-session";
import { randomBytes } from "crypto";
import { v4 as uuidv4 } from "uuid";
import connectPg from "connect-pg-simple";
import { pool, db } from "./db";
import { and, eq, desc, asc } from "drizzle-orm";

const PostgresSessionStore = connectPg(session);

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
  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()));
    return user || undefined;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users)
      .values({
        ...userData,
        email: userData.email.toLowerCase(),
        verified: false,
        reset_token: null,
        reset_token_expires: null,
        responses_available: 20,
        tier_id: 4
      })
      .returning();
    
    return user;
  }

  async updateUser(userId: number, userData: Partial<User>): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set(userData)
      .where(eq(users.id, userId))
      .returning();
    
    return user || undefined;
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
    const now = new Date();
    
    const [user] = await db.select()
      .from(users)
      .where(and(
        eq(users.reset_token, token)
        // Due to limitations with Drizzle type system, we'll handle
        // the expiration date check in application code
      ));
    
    if (user && user.reset_token_expires && user.reset_token_expires > now) {
      return user;
    }
    
    return undefined;
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
    return await db.select().from(lists);
  }

  async getListById(id: number): Promise<List | undefined> {
    const [list] = await db.select().from(lists).where(eq(lists.id, id));
    return list || undefined;
  }

  // Message methods
  async getMessagesByUserAndList(userId: number, listId: number): Promise<Message[]> {
    return await db.select()
      .from(messages)
      .where(and(
        eq(messages.user_id, userId),
        eq(messages.lista_id, listId)
      ))
      .orderBy(asc(messages.created_at));
  }

  async createMessage(messageData: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages)
      .values({
        ...messageData,
        ai_response: null,
        created_at: new Date()
      })
      .returning();
    
    return message;
  }

  // Subscription methods
  async getTiers(): Promise<Tier[]> {
    return await db.select()
      .from(tiers)
      .orderBy(asc(tiers.tier_id));
  }

  async getTierById(id: number): Promise<Tier | undefined> {
    const [tier] = await db.select().from(tiers).where(eq(tiers.tier_id, id));
    return tier || undefined;
  }

  // Checklist methods
  async getChecklistItems(): Promise<ChecklistPlano[]> {
    return await db.select().from(checklistPlanos);
  }

  // Partners methods
  async getActivePartners(): Promise<Parceiro[]> {
    return await db.select()
      .from(parceiros)
      .where(eq(parceiros.ativo, true));
  }
}

export const storage = new DatabaseStorage();
