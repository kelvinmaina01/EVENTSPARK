import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  setMockSession: (user: any) => void;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
  setMockSession: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [mockUser, setMockUser] = useState<any>(() => {
    const saved = localStorage.getItem("mock_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setMockUser(null);
    localStorage.removeItem("mock_user");
  };

  const setMockSession = (user: any) => {
    setMockUser(user);
    if (user) {
      localStorage.setItem("mock_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("mock_user");
    }
  };

  const activeUser = session?.user ?? mockUser;

  return (
    <AuthContext.Provider value={{ session, user: activeUser, loading, signOut, setMockSession }}>
      {children}
    </AuthContext.Provider>
  );
}
