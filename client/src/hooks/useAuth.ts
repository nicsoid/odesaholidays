import { useState, useEffect, createContext, useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface User {
  _id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  credits: number;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username?: string) => Promise<void>;
  logout: () => void;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Return a default auth state when context is not available
    const token = localStorage.getItem("auth_token");
    const storedUser = localStorage.getItem("user");
    
    const user = storedUser ? JSON.parse(storedUser) : null;
    const isAuthenticated = !!token && !!user;

    const { data: authUser, isLoading } = useQuery<User>({
      queryKey: ["/api/auth/me"],
      enabled: isAuthenticated,
      retry: false,
      queryFn: async () => {
        const response = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user");
          throw new Error("Authentication failed");
        }
        const data = await response.json();
        return data.user;
      },
    });

    return {
      user: authUser || user,
      isAuthenticated: isAuthenticated && !isLoading,
      isLoading,
      token,
      login: async () => {},
      register: async () => {},
      logout: () => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
        window.location.href = "/";
      },
    };
  }
  return context;
}

export function useAuthMutations() {
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await apiRequest("POST", "/api/auth/login", { email, password });
      return response.json();
    },
    onSuccess: (data) => {
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async ({ email, password, username }: { email: string; password: string; username?: string }) => {
      const response = await apiRequest("POST", "/api/auth/register", { email, password, username });
      return response.json();
    },
    onSuccess: (data) => {
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
  });

  return {
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    isLoading: loginMutation.isPending || registerMutation.isPending,
    error: loginMutation.error || registerMutation.error,
  };
}