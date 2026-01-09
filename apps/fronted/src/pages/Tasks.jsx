import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { API_BASE } from "../lib/api.js";

const Tasks = () => {
    const { logout } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("todo");
    const [dueDate, setDueDate] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editStatus, setEditStatus] = useState("todo");
    const [editDueDate, setEditDueDate] = useState("");
    const [now, setNow] = useState(Date.now());

    const formatTimeLeft = (dateString) => {
        if (!dateString) return "No due date";
        const now = new Date();
        const due = new Date(dateString);
        const diffMs = due.getTime() - now.getTime();
        if (Number.isNaN(due.getTime())) return "Invalid date";
        if (diffMs <= 0) return "Overdue";
        const totalMinutes = Math.floor(diffMs / 60000);
        const days = Math.floor(totalMinutes / (60 * 24));
        const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
        const minutes = totalMinutes % 60;
        if (days > 0) return `${days}d ${hours}h left`;
        if (hours > 0) return `${hours}h ${minutes}m left`;
        return `${minutes}m left`;
    };

    // Load the user's tasks from the API.
    const loadTasks = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE}/api/tasks`, {
                credentials: "include"
            });
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.message || "Failed to load tasks.");
            }
            const data = await response.json();
            setTasks(data || []);
        } catch (err) {
            setError(err.message || "Failed to load tasks.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTasks();
    }, []);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setNow(Date.now());
        }, 60000);
        return () => clearInterval(intervalId);
    }, []);

    // Create a new task using the API.
    const handleCreate = async (event) => {
        event.preventDefault();
        setError("");
        try {
            const response = await fetch(`${API_BASE}/api/tasks`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    title,
                    description: description.trim() || undefined,
                    status,
                    dueDate: dueDate || undefined
                })
            });
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.message || "Failed to create task.");
            }
            setTitle("");
            setDescription("");
            setStatus("todo");
            setDueDate("");
            await loadTasks();
        } catch (err) {
            setError(err.message || "Failed to create task.");
        }
    };

    const startEdit = (task) => {
        setEditingId(task._id);
        setEditTitle(task.title || "");
        setEditDescription(task.description || "");
        setEditStatus(task.status || "todo");
        setEditDueDate(task.dueDate ? task.dueDate.slice(0, 10) : "");
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditTitle("");
        setEditDescription("");
        setEditStatus("todo");
        setEditDueDate("");
    };

    const handleUpdate = async (event) => {
        event.preventDefault();
        if (!editingId) return;
        setError("");
        try {
            const response = await fetch(`${API_BASE}/api/tasks/${editingId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    title: editTitle,
                    description: editDescription.trim() || "",
                    status: editStatus,
                    dueDate: editDueDate || null
                })
            });
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.message || "Failed to update task.");
            }
            await loadTasks();
            cancelEdit();
        } catch (err) {
            setError(err.message || "Failed to update task.");
        }
    };

    const handleDelete = async (taskId) => {
        setError("");
        try {
            const response = await fetch(`${API_BASE}/api/tasks/${taskId}`, {
                method: "DELETE",
                credentials: "include"
            });
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.message || "Failed to delete task.");
            }
            await loadTasks();
        } catch (err) {
            setError(err.message || "Failed to delete task.");
        }
    };

    const cardStyle = {
        padding: "16px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        marginBottom: "12px"
    };

    return (
        <div style={{ maxWidth: "720px", margin: "0 auto", padding: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h1>Your Tasks</h1>
                <button type="button" onClick={logout}>
                    Logout
                </button>
            </div>
            <form onSubmit={handleCreate} style={cardStyle}>
                <h2>Create a task</h2>
                <div style={{ display: "grid", gap: "8px" }}>
                    <input
                        type="text"
                        placeholder="Task title"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        required
                    />
                    <textarea
                        placeholder="Short description"
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        rows={3}
                    />
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <select value={status} onChange={(event) => setStatus(event.target.value)}>
                            <option value="todo">Todo</option>
                            <option value="in-progress">In progress</option>
                            <option value="done">Done</option>
                        </select>
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(event) => setDueDate(event.target.value)}
                        />
                        <button type="submit">Add</button>
                    </div>
                </div>
            </form>
            {error && <p>{error}</p>}
            {loading ? (
                <p>Loading...</p>
            ) : (
                <ul>
                    {tasks.map((task) => (
                        <li key={task._id}>
                            <div style={cardStyle}>
                                {editingId === task._id ? (
                                    <form onSubmit={handleUpdate}>
                                        <div style={{ display: "grid", gap: "8px" }}>
                                            <input
                                                type="text"
                                                value={editTitle}
                                                onChange={(event) => setEditTitle(event.target.value)}
                                                required
                                            />
                                            <textarea
                                                value={editDescription}
                                                onChange={(event) => setEditDescription(event.target.value)}
                                                rows={3}
                                            />
                                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                                <select
                                                    value={editStatus}
                                                    onChange={(event) => setEditStatus(event.target.value)}
                                                >
                                                    <option value="todo">Todo</option>
                                                    <option value="in-progress">In progress</option>
                                                    <option value="done">Done</option>
                                                </select>
                                                <input
                                                    type="date"
                                                    value={editDueDate}
                                                    onChange={(event) => setEditDueDate(event.target.value)}
                                                />
                                                <button type="submit">Save</button>
                                                <button type="button" onClick={cancelEdit}>
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        <div>
                                            <strong>{task.title}</strong> ({task.status})
                                        </div>
                                        {task.description && <div>{task.description}</div>}
                                        <div>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "None"}</div>
                                        <div>Time left: {formatTimeLeft(task.dueDate)}</div>
                                        <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                                            <button type="button" onClick={() => startEdit(task)}>
                                                Edit
                                            </button>
                                            <button type="button" onClick={() => handleDelete(task._id)}>
                                                Delete
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Tasks;
