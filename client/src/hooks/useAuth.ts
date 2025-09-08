import { useState, useEffect } from "react";
import { storage, type Admin } from "@/lib/storage";

export function useAuth() {
  const [user, setUser] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentAdmin = storage.getCurrentAdmin();
    setUser(currentAdmin);
    setIsLoading(false);
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
