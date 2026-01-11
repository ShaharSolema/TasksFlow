import { useEffect, useMemo, useState } from "react";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell
} from "recharts";
import { useAuth } from "../context/AuthContext.jsx";
import { API_BASE } from "../lib/api.js";

const STATUS_COLORS = {
    "todo": "#7ac4b8",
    "in-progress": "#d4b06a",
    "done": "#6db897"
};

const JOB_STATUS_COLORS = [
    "#6db897",
    "#a89068",
    "#b87a68",
    "#4a9e92",
    "#d4a090"
];

// Admin analytics dashboard.
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

    const tasksPerDay = useMemo(
        () =>
            (data?.tasksPerDay || []).map((item) => ({
                date: item._id,
                count: item.count
            })),
        [data]
    );

    const statusDistribution = useMemo(
        () =>
            (data?.statusDistribution || []).map((item) => ({
                name: item._id,
                value: item.count
            })),
        [data]
    );

    const jobsPerDay = useMemo(
        () =>
            (data?.jobsPerDay || []).map((item) => ({
                date: item._id,
                count: item.count
            })),
        [data]
    );

    const jobStatusDistribution = useMemo(
        () =>
            (data?.jobStatusDistribution || []).map((item) => ({
                name: item._id,
                value: item.count
            })),
        [data]
    );

    const jobTypeDistribution = useMemo(
        () =>
            (data?.jobTypeDistribution || []).map((item) => ({
                name: item._id,
                value: item.count
            })),
        [data]
    );

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
                <div className="inline-loading">
                    <span className="mini-spinner" />
                    <span className="muted">Loading analytics...</span>
                </div>
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
                            <span className="pill">Jobs: {data.kpis.totalJobs}</span>
                            <span className="pill">Completion: {data.kpis.completionRate}%</span>
                        </div>
                    </div>
                    <div className="card chart-card">
                        <h2>Tasks per day</h2>
                        <div className="chart-shell">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={tasksPerDay}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.12)" />
                                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#000" }} />
                                    <YAxis allowDecimals={false} tick={{ fill: "#000" }} />
                                    <Tooltip
                                        contentStyle={{ color: "#000" }}
                                        labelStyle={{ color: "#000" }}
                                    />
                                    <Line type="monotone" dataKey="count" stroke="#34d399" strokeWidth={3} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="card chart-card">
                        <h2>Jobs per day</h2>
                        <div className="chart-shell">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={jobsPerDay}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.12)" />
                                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#000" }} />
                                    <YAxis allowDecimals={false} tick={{ fill: "#000" }} />
                                    <Tooltip
                                        contentStyle={{ color: "#000" }}
                                        labelStyle={{ color: "#000" }}
                                    />
                                    <Line type="monotone" dataKey="count" stroke="#d4a574" strokeWidth={3} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="card chart-grid">
                        <div>
                            <h2>Status distribution</h2>
                            <div className="chart-shell small">
                                <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={statusDistribution} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                                                {statusDistribution.map((entry) => (
                                                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || "#c8b48c"} />
                                                ))}
                                            </Pie>
                                        <Tooltip
                                            contentStyle={{ color: "#000" }}
                                            labelStyle={{ color: "#000" }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div>
                            <h2>Top users</h2>
                            <div className="chart-shell small">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.topUsers || []}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.12)" />
                                        <XAxis dataKey="username" tick={{ fontSize: 12, fill: "#000" }} />
                                        <YAxis allowDecimals={false} tick={{ fill: "#000" }} />
                                        <Tooltip
                                            contentStyle={{ color: "#000" }}
                                            labelStyle={{ color: "#000" }}
                                        />
                                        <Bar dataKey="count" fill="#34d399" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div>
                            <h2>Job status</h2>
                            <div className="chart-shell small">
                                <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={jobStatusDistribution} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                                                {jobStatusDistribution.map((entry, index) => (
                                                    <Cell key={entry.name} fill={JOB_STATUS_COLORS[index % JOB_STATUS_COLORS.length]} />
                                                ))}
                                            </Pie>
                                        <Tooltip
                                            contentStyle={{ color: "#000" }}
                                            labelStyle={{ color: "#000" }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div>
                            <h2>Job types</h2>
                            <div className="chart-shell small">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={jobTypeDistribution}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.12)" />
                                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#000" }} />
                                        <YAxis allowDecimals={false} tick={{ fill: "#000" }} />
                                        <Tooltip
                                            contentStyle={{ color: "#000" }}
                                            labelStyle={{ color: "#000" }}
                                        />
                                        <Bar dataKey="value" fill="#d4a574" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div>
                            <h2>Top companies</h2>
                            <div className="chart-shell small">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.topCompanies || []}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.12)" />
                                        <XAxis dataKey="company" tick={{ fontSize: 12, fill: "#000" }} />
                                        <YAxis allowDecimals={false} tick={{ fill: "#000" }} />
                                        <Tooltip
                                            contentStyle={{ color: "#000" }}
                                            labelStyle={{ color: "#000" }}
                                        />
                                        <Bar dataKey="count" fill="#7ac4b8" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Charts;
