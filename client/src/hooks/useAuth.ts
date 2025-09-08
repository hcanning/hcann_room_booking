import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const hasToken = !!localStorage.getItem('authToken');
  
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    enabled: hasToken, // Only make the request if we have a token
  });

  return {
    user,
    isLoading: hasToken ? isLoading : false,
    isAuthenticated: hasToken && !!user,
  };
}
