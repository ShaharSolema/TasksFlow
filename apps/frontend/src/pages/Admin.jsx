import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { API_BASE } from "../lib/api.js";

const Admin = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Small fetch helper for admin requests.
    const fetchJson = async (path, options = {}) => {
        const response = await fetch(`${API_BASE}${path}`, {
            credentials: "include",
            ...options
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(data.message || "Request failed.");
        }
        return data;
    };

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await fetchJson("/api/admin/users");
            setUsers(data.users || []);
        } catch (err) {
            setError(err.message || "Failed to load users.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === "admin") {
            loadUsers();
        }
    }, [user]);

    const updateRole = async (userId, role) => {
        try {
            await fetchJson(`/api/admin/users/${userId}/role`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role })
            });
            await loadUsers();
        } catch (err) {
            setError(err.message || "Failed to update role.");
        }
    };

    // Guard: only admins can view this page.
    if (!user || user.role !== "admin") {
        return (
            <div className="page">
                <h1>Admin</h1>
                <p className="error">You do not have access to this page.</p>
            </div>
        );
    }

    return (
        <div className="page">
            <h1>Admin Dashboard</h1>
            {error && <p className="error">{error}</p>}
            {loading ? (
                <p className="muted">Loading users...</p>
            ) : (
                <div className="card">
                    <h2>User Management</h2>
                    <div className="table">
                        <div className="table-row table-head">
                            <span>Username</span>
                            <span>Email</span>
                            <span>Role</span>
                            <span>Action</span>
                        </div>
                        {users.map((entry) => (
                            <div key={entry._id} className="table-row">
                                <span>{entry.username}</span>
                                <span>{entry.email}</span>
                                <span>{entry.role}</span>
                                <button
                                    type="button"
                                    className="button secondary"
                                    onClick={() =>
                                        updateRole(entry._id, entry.role === "admin" ? "user" : "admin")
                                    }
                                >
                                    Make {entry.role === "admin" ? "User" : "Admin"}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Admin;
