import { type User, type InsertUser } from "@shared/schema";
import { AnalyticsEvent, AnalyticsStats } from "@shared/analytics";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Analytics operations
  recordAnalyticsEvent(event: Omit<AnalyticsEvent, 'id' | 'timestamp'>): Promise<void>;
  getAnalyticsStats(limit?: number): Promise<AnalyticsStats>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private analyticsEvents: AnalyticsEvent[];

  constructor() {
    this.users = new Map();
    this.analyticsEvents = [];
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async recordAnalyticsEvent(eventData: Omit<AnalyticsEvent, 'id' | 'timestamp'>): Promise<void> {
    const event: AnalyticsEvent = {
      id: randomUUID(),
      timestamp: new Date(),
      ...eventData
    };
    this.analyticsEvents.push(event);
    
    // Keep only the last 1000 events to prevent memory issues
    if (this.analyticsEvents.length > 1000) {
      this.analyticsEvents = this.analyticsEvents.slice(-1000);
    }
  }

  async getAnalyticsStats(limit: number = 100): Promise<AnalyticsStats> {
    const events = this.analyticsEvents.slice(-limit);
    
    const totalRequests = events.length;
    const successfulRequests = events.filter(e => e.success).length;
    const failedRequests = totalRequests - successfulRequests;
    const successRate = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0;
    
    const styleBreakdown = {
      professional: events.filter(e => e.style === 'professional').length,
      casual: events.filter(e => e.style === 'casual').length,
      creative: events.filter(e => e.style === 'creative').length,
    };
    
    const generationTimes = events
      .filter(e => e.success && e.generationTime)
      .map(e => e.generationTime!);
    const averageGenerationTime = generationTimes.length > 0 
      ? generationTimes.reduce((a, b) => a + b, 0) / generationTimes.length 
      : 0;
    
    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      successRate,
      styleBreakdown,
      averageGenerationTime,
      recentEvents: events.slice(-10) // Last 10 events
    };
  }
}

export const storage = new MemStorage();
