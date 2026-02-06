import { useState, useEffect } from "react";

interface AuthState {
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AUTH_KEY = "admin_auth";
const ADMIN_PASSWORD = "548413";

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    isAdmin: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already authenticated on mount
  useEffect(() => {
    const storedAuth = localStorage.getItem(AUTH_KEY);
    if (storedAuth) {
      try {
        const parsed = JSON.parse(storedAuth);
        setAuth({
          isAuthenticated: true,
          isAdmin: parsed.isAdmin,
        });
      } catch {
        localStorage.removeItem(AUTH_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      const authData = { isAdmin: true, timestamp: Date.now() };
      localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
      setAuth({
        isAuthenticated: true,
        isAdmin: true,
      });
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    setAuth({
      isAuthenticated: false,
      isAdmin: false,
    });
  };

  return {
    ...auth,
    isLoading,
    login,
    logout,
  };
}
