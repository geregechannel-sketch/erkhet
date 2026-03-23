"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState
} from "react";
import { ApiError, authHeaders, browserApiFetch } from "@/lib/api";
import type { AuthResponse, Tour, User } from "@/lib/types";

type RegisterPayload = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

type AuthContextValue = {
  user: User | null;
  token: string | null;
  savedSlugs: string[];
  loading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  saveTour: (slug: string) => Promise<void>;
  unsaveTour: (slug: string) => Promise<void>;
  isSaved: (slug: string) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const TOKEN_KEY = "erkhet.auth.token";

async function loadSavedTours(token: string) {
  const favorites = await browserApiFetch<Tour[]>("/me/favorites", {
    headers: authHeaders(token)
  });
  return favorites.map((item) => item.slug);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [savedSlugs, setSavedSlugs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const storedToken = typeof window === "undefined" ? null : window.localStorage.getItem(TOKEN_KEY);
    if (!storedToken) {
      setUser(null);
      setToken(null);
      setSavedSlugs([]);
      setLoading(false);
      return;
    }

    try {
      const [me, saved] = await Promise.all([
        browserApiFetch<User>("/auth/me", { headers: authHeaders(storedToken) }),
        loadSavedTours(storedToken)
      ]);
      setToken(storedToken);
      setUser(me);
      setSavedSlugs(saved);
    } catch {
      window.localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
      setSavedSlugs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshUser();
  }, []);

  const handleAuth = async (path: string, payload: LoginPayload | RegisterPayload) => {
    const response = await browserApiFetch<AuthResponse>(path, {
      method: "POST",
      body: JSON.stringify(payload)
    });
    window.localStorage.setItem(TOKEN_KEY, response.token);
    setToken(response.token);
    setUser(response.user);
    setSavedSlugs([]);
    const saved = await loadSavedTours(response.token).catch(() => []);
    setSavedSlugs(saved);
  };

  const login = async (payload: LoginPayload) => {
    await handleAuth("/auth/login", payload);
  };

  const register = async (payload: RegisterPayload) => {
    await handleAuth("/auth/register", payload);
  };

  const logout = async () => {
    if (token) {
      try {
        await browserApiFetch<{ ok: boolean }>("/auth/logout", {
          method: "POST",
          headers: authHeaders(token)
        });
      } catch {
        // Ignore logout transport errors so local session still clears.
      }
    }
    window.localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setToken(null);
    setSavedSlugs([]);
  };

  const saveTour = async (slug: string) => {
    if (!token) {
      throw new ApiError("Та эхлээд нэвтэрнэ үү.", 401);
    }
    await browserApiFetch<{ ok: boolean }>(`/me/favorites/${slug}`, {
      method: "POST",
      headers: authHeaders(token)
    });
    setSavedSlugs((current) => (current.includes(slug) ? current : [...current, slug]));
  };

  const unsaveTour = async (slug: string) => {
    if (!token) {
      throw new ApiError("Та эхлээд нэвтэрнэ үү.", 401);
    }
    await browserApiFetch<{ ok: boolean }>(`/me/favorites/${slug}`, {
      method: "DELETE",
      headers: authHeaders(token)
    });
    setSavedSlugs((current) => current.filter((item) => item !== slug));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        savedSlugs,
        loading,
        login,
        register,
        logout,
        refreshUser,
        saveTour,
        unsaveTour,
        isSaved: (slug: string) => savedSlugs.includes(slug)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
