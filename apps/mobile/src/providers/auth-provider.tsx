import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { supabase } from "@/lib/supabase";
import { Session, User } from "@supabase/supabase-js";
import { usePushNotifications } from "@/features/notifications/hooks/use-push-notifications";
import { useLiveNotifications } from "@/features/notifications/hooks/use-live-notifications";

type AuthContext = {
  session: Session | null;
  user: User | undefined;
  isAuthenticated: boolean;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContext>({
  session: null,
  user: undefined,
  isAuthenticated: false,
  isLoading: true,
});

export default function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { registerForPushNotificationsAsync } = usePushNotifications();
  useLiveNotifications(session?.user?.id);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);

      if (session?.user) {
        await registerForPushNotificationsAsync(session.user.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user,
        isAuthenticated: !!session?.user && !session?.user.is_anonymous,
        isLoading: loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
