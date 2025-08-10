import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface AuthUser {
  _id: string;
  email: string;
  role?: string;
  createdAt: Date;
  // Add any other user properties from your schema
}

export function useAuth() {
  const { data: authData, isLoading, error } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    user: (authData as any)?.user as AuthUser | undefined,
    isLoading,
    isAuthenticated: !!(authData as any)?.user,
    error,
    logout: async () => {
      try {
        await apiRequest("POST", "/api/auth/logout");
      } catch (error) {
        // Continue with logout even if server call fails
      } finally {
        // Clear token from localStorage
        localStorage.removeItem("auth_token");
        // Clear all React Query cache
        queryClient.clear();
        // Force reload to clear any cached state
        window.location.reload();
      }
    }
  };
}