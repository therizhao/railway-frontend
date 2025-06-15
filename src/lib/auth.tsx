import { BACKEND_URL } from "@/config";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    ReactNode
  } from "react";
  
  type AuthCtx = {
    isAuth: boolean | null;          // null = loading / unknown
    login: (password: string) => Promise<boolean>;
    logout: () => Promise<void>;
  };
  
  const Ctx = createContext<AuthCtx | null>(null);
  export const useAuth = () => useContext(Ctx)!;
  
  export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuth, setIsAuth] = useState<boolean | null>(null);
  
    // One-time check: am I already logged in?
    useEffect(() => {
      (async () => {
        try {
          const res = await fetch(`${BACKEND_URL}/gql`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: "{__typename}" }) // harmless
          });
          setIsAuth(res.status === 200);
        } catch {
          setIsAuth(false);
        }
      })();
    }, []);
  
    const login = useCallback(async (password: string) => {
      const res = await fetch(`${BACKEND_URL}/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
  
      const ok = res.status === 200;
      setIsAuth(ok);
      return ok;
    }, []);

    const logout = useCallback(async () => {
      await fetch(`${BACKEND_URL}/logout`, { method: "POST", credentials: "include" });
      setIsAuth(false);
    }, []);
  
    return <Ctx.Provider value={{ isAuth, login, logout }}>{children}</Ctx.Provider>;
  }
  