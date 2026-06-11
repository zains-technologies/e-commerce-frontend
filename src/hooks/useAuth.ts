"use client";

import { useState } from "react";
import { authService } from "@/services/authService";
import type { User } from "@/types/user";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(email: string, password: string) {
    setLoading(true);
    try {
      const data = await authService.login({ email, password });
      setUser(data.user);
      setError(null);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function register(name: string, email: string, password: string) {
    setLoading(true);
    try {
      const data = await authService.register({ name, email, password });
      setUser(data.user);
      setError(null);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return { user, loading, error, login, register };
}

