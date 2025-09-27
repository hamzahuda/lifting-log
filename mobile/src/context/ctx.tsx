import { ReactNode, useState, useEffect, createContext, use } from "react";
import { supabase } from "../utils/supabase";
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
        // Fetch the initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setIsLoading(false);
        });

        // Listen for changes in authentication state
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
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
