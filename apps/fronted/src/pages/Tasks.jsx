import { useEffect, useState } from "react";
import { API_BASE } from "../lib/api.js";

const Tasks = () => {
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

    return (
        <div className="page">
            <h1>Your Tasks</h1>
            <form onSubmit={handleCreate} className="card">
                <h2>Create a task</h2>
                <div className="form-grid">
                    <input
                        type="text"
                        placeholder="Task title"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        required
                        className="input"
                    />
                    <textarea
                        placeholder="Short description"
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        rows={3}
                        className="textarea"
                    />
                    <div className="row">
                        <select value={status} onChange={(event) => setStatus(event.target.value)} className="select">
                            <option value="todo">Todo</option>
                            <option value="in-progress">In progress</option>
                            <option value="done">Done</option>
                        </select>
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(event) => setDueDate(event.target.value)}
                            className="input"
                        />
                        <button type="submit" className="button">Add</button>
                    </div>
                </div>
            </form>
            {error && <p className="error">{error}</p>}
            {loading ? (
                <p className="muted">Loading...</p>
            ) : (
                <ul className="task-list">
                    {tasks.map((task) => (
                        <li key={task._id}>
                            <div className="card">
                                {editingId === task._id ? (
                                    <form onSubmit={handleUpdate}>
                                        <div className="form-grid">
                                            <input
                                                type="text"
                                                value={editTitle}
                                                onChange={(event) => setEditTitle(event.target.value)}
                                                required
                                                className="input"
                                            />
                                            <textarea
                                                value={editDescription}
                                                onChange={(event) => setEditDescription(event.target.value)}
                                                rows={3}
                                                className="textarea"
                                            />
                                            <div className="row">
                                                <select
                                                    value={editStatus}
                                                    onChange={(event) => setEditStatus(event.target.value)}
                                                    className="select"
                                                >
                                                    <option value="todo">Todo</option>
                                                    <option value="in-progress">In progress</option>
                                                    <option value="done">Done</option>
                                                </select>
                                                <input
                                                    type="date"
                                                    value={editDueDate}
                                                    onChange={(event) => setEditDueDate(event.target.value)}
                                                    className="input"
                                                />
                                                <button type="submit" className="button">Save</button>
                                                <button type="button" className="button secondary" onClick={cancelEdit}>
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        <div>
                                            <h3 className="task-title">{task.title}</h3>
                                            <span className={`pill ${task.status}`}>{task.status}</span>
                                        </div>
                                        {task.description && <p>{task.description}</p>}
                                        <div className="task-meta">
                                            <span>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "None"}</span>
                                            <span>Time left: {formatTimeLeft(task.dueDate)}</span>
                                        </div>
                                        <div className="row">
                                            <button type="button" className="button secondary" onClick={() => startEdit(task)}>
                                                Edit
                                            </button>
                                            <button type="button" className="button danger" onClick={() => handleDelete(task._id)}>
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
