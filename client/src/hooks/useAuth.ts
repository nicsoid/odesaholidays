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
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem(TOKEN_STORAGE_KEY);
  });

  // Get current user - this query will run if there's a token
  const { data: user, isLoading, error } = useQuery<{ user: User }>({
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

  // Update authentication state based on user data and token presence
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    
    if (!token) {
      setIsAuthenticated(false);
      return;
    }

    // If we have user data, we're authenticated
    if (user?.user) {
      setIsAuthenticated(true);
    } 
    // If query failed with error, clear token and set to unauthenticated
    else if (!isLoading && error) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      setIsAuthenticated(false);
    }
    // If we have a token but no user data yet, keep current state
  }, [user, isLoading, error]);

  return {
    isAuthenticated,
    isLoading,
    user: user?.user || null,
    login: loginMutation.mutateAsync,
    logout,
  };
}