// src/context/auth-context.jsx

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

const getStoredUser = () => {
    try { return JSON.parse(localStorage.getItem("user") || "null"); }
    catch { return null; }
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(getStoredUser);

    // API para actualizar y limpiar
    const updateUser = (next) => {
        setUser(next);
        if (next) localStorage.setItem("user", JSON.stringify(next));
        else localStorage.removeItem("user");
    };

    const logout = () => {
        localStorage.removeItem("token");
        updateUser(null);
    };

    // Sincroniza entre pestañas
    useEffect(() => {
        const onStorage = (e) => {
            if (e.key === "user") setUser(getStoredUser());
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    const value = useMemo(() => ({ user, updateUser, logout }), [user]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
    return ctx;
};
