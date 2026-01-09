import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { API_BASE } from "../lib/api.js";

const Charts = () => {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadAnalytics = async () => {
            if (!user || user.role !== "admin") return;
            try {
                setLoading(true);
                const response = await fetch(`${API_BASE}/api/admin/analytics`, {
                    credentials: "include"
                });
                if (!response.ok) {
                    const body = await response.json().catch(() => ({}));
                    throw new Error(body.message || "Failed to load analytics.");
                }
                const payload = await response.json();
                setData(payload);
            } catch (err) {
                setError(err.message || "Failed to load analytics.");
            } finally {
                setLoading(false);
            }
        };

        loadAnalytics();
    }, [user]);

    if (!user || user.role !== "admin") {
        return (
            <div className="page">
                <h1>Charts</h1>
                <p className="error">Admin access required.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="page">
                <h1>Charts</h1>
                <p className="muted">Loading analytics...</p>
            </div>
        );
    }

    return (
        <div className="page">
            <h1>Charts</h1>
            {error && <p className="error">{error}</p>}
            {data && (
                <div className="stack">
                    <div className="card">
                        <h2>Key Metrics</h2>
                        <div className="row">
                            <span className="pill">Users: {data.kpis.totalUsers}</span>
                            <span className="pill">Tasks: {data.kpis.totalTasks}</span>
                            <span className="pill">Completion: {data.kpis.completionRate}%</span>
                        </div>
                    </div>
                    <div className="card">
                        <h2>Tasks per day</h2>
                        <div className="bar-chart">
                            {(data.tasksPerDay || []).map((item) => (
                                <div key={item._id} className="bar-row">
                                    <span>{item._id}</span>
                                    <div className="bar">
                                        <div
                                            className="bar-fill"
                                            style={{ width: `${Math.min(item.count * 15, 100)}%` }}
                                        />
                                    </div>
                                    <span>{item.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="card">
                        <h2>Status distribution</h2>
                        <div className="row">
                            {(data.statusDistribution || []).map((item) => (
                                <span key={item._id} className={`pill ${item._id}`}>
                                    {item._id}: {item.count}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="card">
                        <h2>Top users</h2>
                        <ul className="task-list">
                            {(data.topUsers || []).map((item) => (
                                <li key={item.userId}>
                                    {item.username}: {item.count} tasks
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Charts;
