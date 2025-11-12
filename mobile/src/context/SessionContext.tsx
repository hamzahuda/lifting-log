import { ReactNode, useState, useEffect, createContext, use } from "react";
import { supabase } from "../services/supabase";
import { Session } from "@supabase/supabase-js";

const SessionContext = createContext<{
    session: Session | null;
    isLoading: boolean;
}>({ session: null, isLoading: true });

export function useSession() {
    const value = use(SessionContext);
    if (!value) {
        throw new Error("useSession must be wrapped in a <SessionProvider />");
    }

    return value;
}

export function SessionProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Listen for changes in authentication state
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setIsLoading(false);
        });

        // Clean up the subscription on unmount
        return () => subscription.unsubscribe();
    }, []);

    return (
        <SessionContext.Provider value={{ session, isLoading }}>
            {children}
        </SessionContext.Provider>
    );
}
