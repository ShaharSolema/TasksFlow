import { useEffect, useMemo, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { API_BASE } from "../lib/api.js";

const Tasks = () => {
    const [tasks, setTasks] = useState([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("todo");
    const [category, setCategory] = useState("other");
    const [dueDate, setDueDate] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editStatus, setEditStatus] = useState("todo");
    const [editCategory, setEditCategory] = useState("other");
    const [editDueDate, setEditDueDate] = useState("");
    const [now, setNow] = useState(Date.now());
    const [statusFilter, setStatusFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [search, setSearch] = useState("");

    const formatTimeLeft = (dateString) => {
        if (!dateString) return "No due date";
        const current = new Date(now);
        const due = new Date(dateString);
        const diffMs = due.getTime() - current.getTime();
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
                    category,
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
            setCategory("other");
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
        setEditCategory(task.category || "other");
        setEditDueDate(task.dueDate ? task.dueDate.slice(0, 10) : "");
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditTitle("");
        setEditDescription("");
        setEditStatus("todo");
        setEditCategory("other");
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
                    category: editCategory,
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

    const cycleStatus = async (task) => {
        const order = ["todo", "in-progress", "done"];
        const currentIndex = order.indexOf(task.status);
        const nextStatus = order[(currentIndex + 1) % order.length];
        try {
            const response = await fetch(`${API_BASE}/api/tasks/${task._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ status: nextStatus })
            });
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.message || "Failed to update task.");
            }
            await loadTasks();
        } catch (err) {
            setError(err.message || "Failed to update task.");
        }
    };

    const filteredTasks = tasks.filter((task) => {
        const statusMatch = statusFilter === "all" || task.status === statusFilter;
        const categoryMatch = categoryFilter === "all" || task.category === categoryFilter;
        const searchMatch =
            !search ||
            task.title.toLowerCase().includes(search.toLowerCase()) ||
            (task.description || "").toLowerCase().includes(search.toLowerCase());
        return statusMatch && categoryMatch && searchMatch;
    });

    const groupedTasks = useMemo(() => {
        const base = {
            "todo": [],
            "in-progress": [],
            "done": []
        };
        for (const task of filteredTasks) {
            if (base[task.status]) {
                base[task.status].push(task);
            }
        }
        return base;
    }, [filteredTasks]);

    const onDragEnd = async (result) => {
        if (!result.destination) return;
        const { destination, draggableId } = result;
        const nextStatus = destination.droppableId;
        const task = tasks.find((item) => item._id === draggableId);
        if (!task || task.status === nextStatus) return;
        try {
            const response = await fetch(`${API_BASE}/api/tasks/${draggableId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ status: nextStatus })
            });
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.message || "Failed to update task.");
            }
            await loadTasks();
        } catch (err) {
            setError(err.message || "Failed to update task.");
        }
    };

    return (
        <div className="page">
            <div className="hero">
                <div>
                    <h1>Your Tasks</h1>
                    <p className="muted">Organize your day with clean focus.</p>
                </div>
                <span className="badge">{filteredTasks.length} tasks</span>
            </div>
            <div className="task-grid">
                <div className="task-board">
                    {error && <p className="error">{error}</p>}
                    {loading ? (
                        <p className="muted">Loading...</p>
                    ) : (
                        <DragDropContext onDragEnd={onDragEnd}>
                            <div className="kanban">
                                {["todo", "in-progress", "done"].map((statusKey) => (
                                    <Droppable key={statusKey} droppableId={statusKey}>
                                        {(provided) => (
                                            <div className="kanban-column" ref={provided.innerRef} {...provided.droppableProps}>
                                                <div className="kanban-header">
                                                    <h3>{statusKey.replace("-", " ")}</h3>
                                                    <span className="badge">{groupedTasks[statusKey].length}</span>
                                                </div>
                                                <div className="kanban-list">
                                                    {groupedTasks[statusKey].map((task, index) => (
                                                        <Draggable key={task._id} draggableId={task._id} index={index}>
                                                            {(dragProvided) => (
                                                                <div
                                                                    className="card task-card"
                                                                    ref={dragProvided.innerRef}
                                                                    {...dragProvided.draggableProps}
                                                                    {...dragProvided.dragHandleProps}
                                                                >
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
                                                                                    <select
                                                                                        value={editCategory}
                                                                                        onChange={(event) => setEditCategory(event.target.value)}
                                                                                        className="select"
                                                                                    >
                                                                                        <option value="work">Work</option>
                                                                                        <option value="personal">Personal</option>
                                                                                        <option value="study">Study</option>
                                                                                        <option value="health">Health</option>
                                                                                        <option value="other">Other</option>
                                                                                    </select>
                                                                                    <input
                                                                                        type="date"
                                                                                        value={editDueDate}
                                                                                        onChange={(event) => setEditDueDate(event.target.value)}
                                                                                        className="input"
                                                                                    />
                                                                                </div>
                                                                                <div className="task-actions">
                                                                                    <button type="submit" className="button">Save</button>
                                                                                    <button type="button" className="button secondary" onClick={cancelEdit}>
                                                                                        Cancel
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        </form>
                                                                    ) : (
                                                                        <>
                                                                            <div className="task-header">
                                                                                <h4 className="task-title">{task.title}</h4>
                                                                                <span className="pill category-pill">{task.category || "other"}</span>
                                                                            </div>
                                                                            {task.description && <p>{task.description}</p>}
                                                                            <div className="task-meta">
                                                                                <span>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "None"}</span>
                                                                                <span>Time left: {formatTimeLeft(task.dueDate)}</span>
                                                                            </div>
                                                                            <div className="task-actions">
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
                                                            )}
                                                        </Draggable>
                                                    ))}
                                                    {provided.placeholder}
                                                </div>
                                            </div>
                                        )}
                                    </Droppable>
                                ))}
                            </div>
                        </DragDropContext>
                    )}
                </div>
                <div className="task-board">
                    <form onSubmit={handleCreate} className="card sticky">
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
                            <select value={status} onChange={(event) => setStatus(event.target.value)} className="select">
                                <option value="todo">Todo</option>
                                <option value="in-progress">In progress</option>
                                <option value="done">Done</option>
                            </select>
                            <select value={category} onChange={(event) => setCategory(event.target.value)} className="select">
                                <option value="work">Work</option>
                                <option value="personal">Personal</option>
                                <option value="study">Study</option>
                                <option value="health">Health</option>
                                <option value="other">Other</option>
                            </select>
                            <input
                                type="date"
                                value={dueDate}
                                onChange={(event) => setDueDate(event.target.value)}
                                className="input"
                            />
                            <button type="submit" className="button">Add task</button>
                        </div>
                    </form>
                    <div className="card sticky">
                        <h2>Filters</h2>
                        <div className="filter-row">
                            <select
                                value={statusFilter}
                                onChange={(event) => setStatusFilter(event.target.value)}
                                className="select"
                            >
                                <option value="all">All status</option>
                                <option value="todo">Todo</option>
                                <option value="in-progress">In progress</option>
                                <option value="done">Done</option>
                            </select>
                            <select
                                value={categoryFilter}
                                onChange={(event) => setCategoryFilter(event.target.value)}
                                className="select"
                            >
                                <option value="all">All categories</option>
                                <option value="work">Work</option>
                                <option value="personal">Personal</option>
                                <option value="study">Study</option>
                                <option value="health">Health</option>
                                <option value="other">Other</option>
                            </select>
                            <input
                                type="search"
                                placeholder="Search tasks"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                className="input"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Tasks;
