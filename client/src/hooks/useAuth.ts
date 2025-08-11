import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import type { User } from '@shared/mongodb-schema';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
}

const TOKEN_STORAGE_KEY = 'odesa_auth_token';

export function useAuth(): AuthContextType {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Get current user
  const { data: user, isLoading } = useQuery<{ user: User }>({
    queryKey: ['/api/auth/me'],
    retry: false,
    enabled: !!localStorage.getItem(TOKEN_STORAGE_KEY),
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await apiRequest('POST', '/api/auth/login', credentials);
      return response.json();
    },
    onSuccess: (data) => {
      localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
      setIsAuthenticated(true);
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
  });

  const logout = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setIsAuthenticated(false);
    queryClient.clear();
    window.location.href = '/';
  };

  // Update authentication state based on user data
  useEffect(() => {
    if (user?.user) {
      setIsAuthenticated(true);
    } else if (!isLoading && !user) {
      setIsAuthenticated(false);
      // Clean up invalid token
      if (localStorage.getItem(TOKEN_STORAGE_KEY)) {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      }
    }
  }, [user, isLoading]);

  return {
    isAuthenticated,
    isLoading,
    user: user?.user || null,
    login: loginMutation.mutateAsync,
    logout,
  };
}