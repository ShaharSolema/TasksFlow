import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { API_BASE } from "../lib/api.js";

const AuthContext = createContext(null);

// Helper to keep API calls consistent and include cookies.
const request = async (path, options = {}) => {
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
};

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch the logged-in user when the app starts.
    const loadCurrentUser = async () => {
        try {
            setLoading(true);
            const data = await request("/api/auth/me");
            setUser(data.user || null);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCurrentUser();
    }, []);

    const login = async (email, password) => {
        await request("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password })
        });
        await loadCurrentUser();
    };

    const register = async (username, email, password) => {
        await request("/api/auth/register", {
            method: "POST",
            body: JSON.stringify({ username, email, password })
        });
    };

    const logout = async () => {
        await request("/api/auth/logout", { method: "POST" });
        setUser(null);
    };

    const updateProfile = async (newUsername, newEmail) => {
        const data = await request("/api/auth/update-profile", {
            method: "PUT",
            body: JSON.stringify({ newUsername, newEmail })
        });
        setUser(data.user || null);
        return data;
    };

    const value = useMemo(
        () => ({
            user,
            loading,
            login,
            register,
            logout,
            updateProfile,
            refresh: loadCurrentUser
        }),
        [user, loading]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = () => useContext(AuthContext);

export { AuthProvider, useAuth };
