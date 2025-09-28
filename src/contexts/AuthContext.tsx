import { createContext, useContext, ReactNode } from "react";
import { useAuth as useFirebaseAuth } from "../hooks/useAuth";

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useFirebaseAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
