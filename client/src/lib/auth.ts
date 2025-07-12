import { apiRequest } from "./queryClient";
import type { LoginData, InsertUser, User } from "@shared/schema";

const TOKEN_KEY = "skillswap_token";

export const auth = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  },

  getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },

  async login(credentials: LoginData): Promise<{ user: User; token: string }> {
    const response = await apiRequest("POST", "/api/auth/login", credentials);
    const data = await response.json();
    
    if (data.token) {
      this.setToken(data.token);
    }
    
    return data;
  },

  async register(userData: InsertUser): Promise<{ user: User; token: string }> {
    const response = await apiRequest("POST", "/api/auth/register", userData);
    const data = await response.json();
    
    if (data.token) {
      this.setToken(data.token);
    }
    
    return data;
  },

  async logout(): Promise<void> {
    this.removeToken();
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const token = this.getToken();
      if (!token) return null;

      const response = await fetch("/api/users/profile", {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.removeToken();
          return null;
        }
        throw new Error("Failed to get current user");
      }

      return await response.json();
    } catch (error) {
      this.removeToken();
      return null;
    }
  },
};
