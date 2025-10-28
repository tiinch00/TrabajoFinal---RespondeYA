// src/context/auth-context.jsx

import { createContext, useContext, useEffect, useState } from "react";

const AuthCtx = createContext(null);

const readStorage = () => {
    try {
        return {
            user: JSON.parse(localStorage.getItem("user") || "null"),
            token: localStorage.getItem("token") || null,
        };
    } catch {
        return { user: null, token: null };
    }
};

const writeStorage = ({ user, token }) => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
};

export function AuthProvider({ children }) {
    const [{ user, token }, setAuth] = useState(() => readStorage());
    const [loading, setLoading] = useState(false);

    const login = (nextUser, nextToken) => {
        const next = { user: nextUser, token: nextToken ?? token ?? null };
        writeStorage(next);
        setAuth(next);
        // notificar (opcional)
        window.dispatchEvent(new Event("auth:user-updated"));
    };

    const updateUser = (patch) => {
        setAuth(prev => {
            const next = { ...prev, user: { ...(prev.user || {}), ...patch } };
            writeStorage(next);
            return next;
        });
        window.dispatchEvent(new Event("auth:user-updated"));
    };

    const logout = () => {
        const next = { user: null, token: null };
        writeStorage(next);
        setAuth(next);
        window.dispatchEvent(new Event("auth:user-updated"));
    };

    // sincroniza si cambia localStorage (otra pestaña/ventana)
    useEffect(() => {
        const onStorage = (e) => {
            if (e.key === "user" || e.key === "token") setAuth(readStorage());
        };
        const onCustom = () => setAuth(readStorage());
        window.addEventListener("storage", onStorage);
        window.addEventListener("auth:user-updated", onCustom);
        return () => {
            window.removeEventListener("storage", onStorage);
            window.removeEventListener("auth:user-updated", onCustom);
        };
    }, []);

    // SIN useMemo: se crea un nuevo objeto en cada render (está bien)
    const value = {
        user,
        token,
        loading,
        setLoading,
        login,
        updateUser,
        logout,
    };

    return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
