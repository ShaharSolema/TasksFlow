import { createContext, useContext, useEffect, useState } from "react";
import { API_BASE } from "../lib/api.js";

const AuthContext = createContext(null);

async function request(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, {
        headers: {
            "Content-Type": "application/json",
            ...options.headers
        },
        credentials: "include",
        ...options
    });

    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.message || "Request failed.");
    }

    return response.json().catch(() => ({}));
}

function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    async function loadCurrentUser() {
        try {
            setLoading(true);
            const data = await request("/api/auth/me");
            setUser(data.user || null);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadCurrentUser();
    }, []);

    async function login(email, password) {
        await request("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password })
        });
        await loadCurrentUser();
    }

    async function register(username, email, password) {
        await request("/api/auth/register", {
            method: "POST",
            body: JSON.stringify({ username, email, password })
        });
    }

    async function logout() {
        await request("/api/auth/logout", { method: "POST" });
        setUser(null);
    }

    async function updateProfile(newUsername, newEmail) {
        const data = await request("/api/auth/update-profile", {
            method: "PUT",
            body: JSON.stringify({ newUsername, newEmail })
        });
        setUser(data.user || null);
        return data;
    }

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        refresh: loadCurrentUser
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth() {
    return useContext(AuthContext);
}

export { AuthProvider, useAuth };
