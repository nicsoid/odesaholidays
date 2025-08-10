import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

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
        window.location.href = "/";
      } catch (error) {
        // If logout fails, still redirect to home
        window.location.href = "/";
      }
    }
  };
}