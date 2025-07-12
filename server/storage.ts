import { users, swapRequests, feedback, type User, type InsertUser, type SwapRequest, type InsertSwapRequest, type Feedback, type InsertFeedback, type UpdateUser } from "@shared/schema";
import { db } from "./db";
import { eq, and, or, ilike, desc, asc, sql } from "drizzle-orm";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: UpdateUser): Promise<User | undefined>;
  searchUsers(params: {
    skill?: string;
    location?: string;
    availability?: string;
    limit?: number;
    offset?: number;
  }): Promise<User[]>;
  getAllUsers(): Promise<User[]>;
  banUser(id: number): Promise<void>;
  
  // Swap requests
  createSwapRequest(swapRequest: InsertSwapRequest): Promise<SwapRequest>;
  getSwapRequest(id: number): Promise<SwapRequest | undefined>;
  updateSwapRequestStatus(id: number, status: string): Promise<SwapRequest | undefined>;
  getUserSwapRequests(userId: number): Promise<SwapRequest[]>;
  getSwapRequestsWithUsers(userId: number): Promise<any[]>;
  
  // Feedback
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  getUserFeedback(userId: number): Promise<Feedback[]>;
  updateUserRating(userId: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser as any)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: UpdateUser): Promise<User | undefined> {
    const updateData: any = { ...updates };
    if (updates.skillsOffered) {
      updateData.skillsOffered = Array.isArray(updates.skillsOffered) ? updates.skillsOffered : [];
    }
    if (updates.skillsWanted) {
      updateData.skillsWanted = Array.isArray(updates.skillsWanted) ? updates.skillsWanted : [];
    }
    
    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async searchUsers(params: {
    skill?: string;
    location?: string;
    availability?: string;
    limit?: number;
    offset?: number;
  }): Promise<User[]> {
    let whereConditions = [eq(users.isPublic, true), eq(users.isBanned, false)];

    if (params.skill) {
      whereConditions.push(
        or(
          sql`${users.skillsOffered} @> ${JSON.stringify([params.skill])}`,
          sql`${users.skillsWanted} @> ${JSON.stringify([params.skill])}`
        )!
      );
    }

    if (params.location) {
      whereConditions.push(ilike(users.location, `%${params.location}%`));
    }

    if (params.availability) {
      whereConditions.push(ilike(users.availability, `%${params.availability}%`));
    }

    return await db
      .select()
      .from(users)
      .where(and(...whereConditions))
      .orderBy(desc(users.rating))
      .limit(params.limit || 10)
      .offset(params.offset || 0);
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async banUser(id: number): Promise<void> {
    await db
      .update(users)
      .set({ isBanned: true })
      .where(eq(users.id, id));
  }

  async createSwapRequest(swapRequest: InsertSwapRequest): Promise<SwapRequest> {
    const [request] = await db
      .insert(swapRequests)
      .values(swapRequest)
      .returning();
    return request;
  }

  async getSwapRequest(id: number): Promise<SwapRequest | undefined> {
    const [request] = await db
      .select()
      .from(swapRequests)
      .where(eq(swapRequests.id, id));
    return request || undefined;
  }

  async updateSwapRequestStatus(id: number, status: string): Promise<SwapRequest | undefined> {
    const [request] = await db
      .update(swapRequests)
      .set({ status, updatedAt: new Date() })
      .where(eq(swapRequests.id, id))
      .returning();
    return request || undefined;
  }

  async getUserSwapRequests(userId: number): Promise<SwapRequest[]> {
    return await db
      .select()
      .from(swapRequests)
      .where(or(eq(swapRequests.senderId, userId), eq(swapRequests.receiverId, userId)))
      .orderBy(desc(swapRequests.createdAt));
  }

  async getSwapRequestsWithUsers(userId: number): Promise<any[]> {
    return await db
      .select({
        id: swapRequests.id,
        offeredSkill: swapRequests.offeredSkill,
        requestedSkill: swapRequests.requestedSkill,
        status: swapRequests.status,
        message: swapRequests.message,
        createdAt: swapRequests.createdAt,
        sender: {
          id: sql`sender.id`,
          name: sql`sender.name`,
          email: sql`sender.email`,
        },
        receiver: {
          id: sql`receiver.id`,
          name: sql`receiver.name`,
          email: sql`receiver.email`,
        },
      })
      .from(swapRequests)
      .leftJoin(sql`${users} as sender`, eq(swapRequests.senderId, sql`sender.id`))
      .leftJoin(sql`${users} as receiver`, eq(swapRequests.receiverId, sql`receiver.id`))
      .where(or(eq(swapRequests.senderId, userId), eq(swapRequests.receiverId, userId)))
      .orderBy(desc(swapRequests.createdAt));
  }

  async createFeedback(feedbackData: InsertFeedback): Promise<Feedback> {
    const [feedbackResult] = await db
      .insert(feedback)
      .values(feedbackData)
      .returning();
    
    // Update user rating after feedback is created
    await this.updateUserRating(feedbackData.revieweeId);
    
    return feedbackResult;
  }

  async getUserFeedback(userId: number): Promise<Feedback[]> {
    return await db
      .select()
      .from(feedback)
      .where(eq(feedback.revieweeId, userId))
      .orderBy(desc(feedback.createdAt));
  }

  async updateUserRating(userId: number): Promise<void> {
    const userFeedback = await this.getUserFeedback(userId);
    
    if (userFeedback.length > 0) {
      const averageRating = userFeedback.reduce((sum, f) => sum + f.rating, 0) / userFeedback.length;
      
      await db
        .update(users)
        .set({ rating: averageRating })
        .where(eq(users.id, userId));
    }
  }
}

export const storage = new DatabaseStorage();
