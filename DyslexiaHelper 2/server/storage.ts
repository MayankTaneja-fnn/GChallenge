import { 
  users, type User, type InsertUser, 
  userPreferences, type UserPreferences, type InsertUserPreferences 
} from "@shared/schema";

// Updated storage interface with user preferences methods
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUserPreferences(userId: string): Promise<UserPreferences | undefined>;
  saveUserPreferences(userId: string, preferences: Partial<InsertUserPreferences>): Promise<UserPreferences>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private preferences: Map<string, UserPreferences>;
  currentId: number;
  currentPreferenceId: number;

  constructor() {
    this.users = new Map();
    this.preferences = new Map();
    this.currentId = 1;
    this.currentPreferenceId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getUserPreferences(userId: string): Promise<UserPreferences | undefined> {
    return this.preferences.get(userId);
  }

  async saveUserPreferences(userId: string, preferences: Partial<InsertUserPreferences>): Promise<UserPreferences> {
    // Get existing preferences or create new ones
    const existingPrefs = this.preferences.get(userId);
    
    if (existingPrefs) {
      // Update existing preferences
      const updatedPrefs: UserPreferences = {
        ...existingPrefs,
        ...preferences,
      };
      this.preferences.set(userId, updatedPrefs);
      return updatedPrefs;
    } else {
      // Create new preferences
      const id = this.currentPreferenceId++;
      const defaultPrefs: UserPreferences = {
        id,
        userId,
        theme: 'light',
        fontFamily: 'roboto',
        fontSize: 16,
        letterSpacing: 1,
        lineHeight: 15,
        customSettings: null,
      };
      
      const newPrefs: UserPreferences = {
        ...defaultPrefs,
        ...preferences,
      };
      
      this.preferences.set(userId, newPrefs);
      return newPrefs;
    }
  }
}

export const storage = new MemStorage();
