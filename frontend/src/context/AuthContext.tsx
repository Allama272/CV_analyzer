import { createContext, useState, useEffect, useContext } from "react";
import { supabase } from "@/supabaseClient";

import type { Session } from "@supabase/supabase-js";
type AuthContextType = {
    session: Session | null;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
};
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthContextProvider = ({ children }: { children: React.ReactElement }) => {
    const [session, setSession] = useState<Session | null>(null);

    useEffect(() => {
        // 1. Check local storage immediately (handles normal page refreshes)
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        // 2. Listen for the OAuth URL parsing to finish
        const { data: listener } = supabase.auth.onAuthStateChange(
            (event, newSession) => {
                if (event === 'SIGNED_IN') {
                    // This will fire the moment Supabase successfully parses that massive URL
                    setSession(newSession);
                } else if (event === 'SIGNED_OUT') {
                    setSession(null);
                }
            }
        );

        return () => {
            listener.subscription.unsubscribe();
        };
    }, []);

    const signInWithGoogle = async () => {
        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo: window.location.origin }
        });
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ session, signInWithGoogle, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const UserAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('UserAuth must be used within an AuthContextProvider');
    }


    return context;
}