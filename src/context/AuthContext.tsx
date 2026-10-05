// aplika-client/src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  location?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => Promise<void>;
  updateUser: (patch: Partial<User>) => void;
}

const getInitialAuth = (): { token: string | null; user: User | null } => {
  try {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (savedToken && savedUser) {
      return {
        token: savedToken,
        user: JSON.parse(savedUser) as User,
      };
    }
  } catch (e) {
    console.error("Error al restaurar sesión inicial:", e);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
  return { token: null, user: null };
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [auth, setAuth] = useState(getInitialAuth);
  const [isLoading] = useState<boolean>(false);

  // #142: además de limpiar el JWT interno, cierra la sesión de Supabase.
  // Sin esto la sesión SSO sobrevivía al logout y el siguiente OAuth
  // entraba directo con la cuenta vieja (auto-login fantasma).
  const logout = useCallback(async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuth({ token: null, user: null });
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error("Error al cerrar sesión de Supabase:", e);
    }
  }, []);

  useEffect(() => {
    // Escuchar evento de desautorización lanzado por apiClient (ej. 401 token vencido)
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [logout]);

  // #142: memoizado para no re-disparar el efecto de AuthCallback.
  const login = useCallback((newToken: string, newUser: User) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    setAuth({ token: newToken, user: newUser });
  }, []);

  // Edición local del perfil (persiste en este dispositivo).
  const updateUser = useCallback(
    (patch: Partial<User>) => {
      setAuth((prev) => {
        if (!prev.user) return prev;
        const next = { ...prev.user, ...patch };
        localStorage.setItem("user", JSON.stringify(next));
        return { ...prev, user: next };
      });
    },
    [],
  );

  return (
    <AuthContext.Provider
      value={{
        user: auth.user,
        token: auth.token,
        isAuthenticated: !!auth.token,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser utilizado dentro de un AuthProvider");
  }
  return context;
};

