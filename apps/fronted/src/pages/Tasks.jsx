
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
    Badge,
    Button,
    ColorInput,
    Group,
    MultiSelect,
    Paper,
    Select,
    Stack,
    Text,
    TextInput,
    Textarea,
    Title
} from "@mantine/core";
import { API_BASE } from "../lib/api.js";

const Tasks = () => {
    const [tasks, setTasks] = useState([]);
    const location = useLocation();
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("");
    const [labels, setLabels] = useState([]);
    const [dueDate, setDueDate] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editStatus, setEditStatus] = useState("");
    const [editLabels, setEditLabels] = useState([]);
    const [editDueDate, setEditDueDate] = useState("");
    const [now, setNow] = useState(Date.now());
    const [statusFilter, setStatusFilter] = useState("all");
    const [search, setSearch] = useState("");

    const [taskLabels, setTaskLabels] = useState([]);
    const [taskColumns, setTaskColumns] = useState([]);
    const [newLabelName, setNewLabelName] = useState("");
    const [newLabelColor, setNewLabelColor] = useState("#6a8c7d");
    const [newColumnName, setNewColumnName] = useState("");
    const [newColumnColor, setNewColumnColor] = useState("#e9dfcf");
    const [editingColumnKey, setEditingColumnKey] = useState(null);
    const [quickAddStatus, setQuickAddStatus] = useState(null);
    const [quickAddTitle, setQuickAddTitle] = useState("");
    const [quickAddLoading, setQuickAddLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    const loadTags = async () => {
        try {
            const response = await fetch(`${API_BASE}/api/tags/task`, {
                credentials: "include"
            });
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.message || "Failed to load categories.");
            }
            const data = await response.json();
            setTaskLabels(data.labels || []);
        } catch (err) {
            setError(err.message || "Failed to load categories.");
        }
    };

    const loadColumns = async () => {
        try {
            const response = await fetch(`${API_BASE}/api/columns/task`, {
                credentials: "include"
            });
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.message || "Failed to load columns.");
            }
            const data = await response.json();
            setTaskColumns(data.columns || []);
            if (data.columns && data.columns.length > 0 && !status) {
                setStatus(data.columns[0].key);
            }
        } catch (err) {
            setError(err.message || "Failed to load columns.");
        }
    };

    useEffect(() => {
        loadTasks();
        loadTags();
        loadColumns();
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const value = params.get("q") || "";
        setSearch((prev) => (prev === value ? prev : value));
    }, [location.search]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setNow(Date.now());
        }, 60000);
        return () => clearInterval(intervalId);
    }, []);

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
                    status: status || taskColumns[0]?.key,
                    labels,
                    dueDate: dueDate || undefined
                })
            });
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.message || "Failed to create task.");
            }
            setTitle("");
            setDescription("");
            setStatus(taskColumns[0]?.key || "");
            setLabels([]);
            setDueDate("");
            await loadTasks();
        } catch (err) {
            setError(err.message || "Failed to create task.");
        }
    };

    const handleQuickAdd = async (statusKey) => {
        const titleValue = quickAddTitle.trim();
        if (!titleValue) return;
        setQuickAddLoading(true);
        try {
            const response = await fetch(`${API_BASE}/api/tasks`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    title: titleValue,
                    status: statusKey
                })
            });
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.message || "Failed to create task.");
            }
            setQuickAddTitle("");
            setQuickAddStatus(null);
            await loadTasks();
        } catch (err) {
            setError(err.message || "Failed to create task.");
        } finally {
            setQuickAddLoading(false);
        }
    };

    const startEdit = (task) => {
        setEditingId(task._id);
        setEditTitle(task.title || "");
        setEditDescription(task.description || "");
        setEditStatus(task.status || "");
        setEditLabels(task.labels || []);
        setEditDueDate(task.dueDate ? task.dueDate.slice(0, 10) : "");
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditTitle("");
        setEditDescription("");
        setEditStatus("");
        setEditLabels([]);
        setEditDueDate("");
        setIsModalOpen(false);
    };

    const openTaskModal = (task) => {
        startEdit(task);
        setIsModalOpen(true);
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
                    labels: editLabels,
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

    const filteredTasks = tasks.filter((task) => {
        const statusMatch = statusFilter === "all" || task.status === statusFilter;
        const searchMatch =
            !search ||
            task.title.toLowerCase().includes(search.toLowerCase()) ||
            (task.description || "").toLowerCase().includes(search.toLowerCase());
        return statusMatch && searchMatch;
    });

    const groupedTasks = useMemo(() => {
        const base = {};
        taskColumns.forEach((col) => {
            base[col.key] = [];
        });
        for (const task of filteredTasks) {
            if (base[task.status]) {
                base[task.status].push(task);
            }
        }
        return base;
    }, [filteredTasks, taskColumns]);

    const onDragEnd = async (result) => {
        if (!result.destination) return;
        const { destination, draggableId, source } = result;
        const nextStatus = destination.droppableId;
        const task = tasks.find((item) => item._id === draggableId);
        if (!task) return;
        const previousTasks = tasks;
        const taskColumnsOrder = taskColumns.map((col) => col.key);
        const withoutTask = tasks.filter((item) => item._id !== draggableId);
        const columnsMap = {};
        taskColumnsOrder.forEach((key) => {
            columnsMap[key] = [];
        });
        withoutTask.forEach((item) => {
            if (!columnsMap[item.status]) {
                columnsMap[item.status] = [];
            }
            columnsMap[item.status].push(item);
        });
        const destinationTasks = columnsMap[nextStatus] || [];
        const movedTask = { ...task, status: nextStatus };
        const insertIndex = Math.max(0, Math.min(destination.index, destinationTasks.length));
        destinationTasks.splice(insertIndex, 0, movedTask);
        columnsMap[nextStatus] = destinationTasks;
        const updatedTasks = [];
        taskColumnsOrder.forEach((key) => {
            if (columnsMap[key]) {
                updatedTasks.push(...columnsMap[key]);
            }
        });
        setTasks(updatedTasks);
        try {
            const affectedStatuses = new Set([source.droppableId, destination.droppableId]);
            const updates = [];
            affectedStatuses.forEach((statusKey) => {
                const list = columnsMap[statusKey] || [];
                list.forEach((item, index) => {
                    updates.push({
                        id: item._id,
                        status: statusKey,
                        order: index
                    });
                });
            });
            const responses = await Promise.all(
                updates.map((item) =>
                    fetch(`${API_BASE}/api/tasks/${item.id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify({ status: item.status, order: item.order })
                    })
                )
            );
            const failed = responses.find((item) => !item.ok);
            if (failed) {
                const data = await failed.json().catch(() => ({}));
                throw new Error(data.message || "Failed to update task.");
            }
        } catch (err) {
            setTasks(previousTasks);
            setError(err.message || "Failed to update task.");
        }
    };

    const labelOptions = useMemo(
        () => taskLabels.map((item) => ({ value: item.name, label: item.name })),
        [taskLabels]
    );

    const labelColors = useMemo(() => {
        const map = {};
        taskLabels.forEach((item) => {
            map[item.name] = item.color || "#c7d6cd";
        });
        return map;
    }, [taskLabels]);

    const statusOptions = useMemo(
        () => taskColumns.map((col) => ({ value: col.key, label: col.name })),
        [taskColumns]
    );

    const columnMeta = useMemo(() => {
        const map = {};
        taskColumns.forEach((col) => {
            map[col.key] = { name: col.name, color: col.color || "#c7d6cd" };
        });
        return map;
    }, [taskColumns]);

    const addLabel = async () => {
        if (!newLabelName.trim()) return;
        try {
            const response = await fetch(`${API_BASE}/api/tags/task/labels`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ name: newLabelName, color: newLabelColor })
            });
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.message || "Failed to add label.");
            }
            const data = await response.json();
            setTaskLabels(data.labels || []);
            setNewLabelName("");
        } catch (err) {
            setError(err.message || "Failed to add label.");
        }
    };

    const addColumn = async () => {
        if (!newColumnName.trim()) return;
        try {
            const response = await fetch(`${API_BASE}/api/columns/task`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ name: newColumnName, color: newColumnColor })
            });
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.message || "Failed to add column.");
            }
            const data = await response.json();
            setTaskColumns(data.columns || []);
            setNewColumnName("");
        } catch (err) {
            setError(err.message || "Failed to add column.");
        }
    };

    const updateColumn = async (columnKey, updates) => {
        try {
            const response = await fetch(`${API_BASE}/api/columns/task/${columnKey}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(updates)
            });
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.message || "Failed to update column.");
            }
            const data = await response.json();
            setTaskColumns(data.columns || []);
        } catch (err) {
            setError(err.message || "Failed to update column.");
        }
    };

    const deleteColumn = async (columnKey) => {
        try {
            const response = await fetch(`${API_BASE}/api/columns/task/${columnKey}`, {
                method: "DELETE",
                credentials: "include"
            });
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.message || "Failed to delete column.");
            }
            const data = await response.json();
            setTaskColumns(data.columns || []);
        } catch (err) {
            setError(err.message || "Failed to delete column.");
        }
    };

    const updateQuery = (value) => {
        const params = new URLSearchParams(location.search);
        if (value) {
            params.set("q", value);
        } else {
            params.delete("q");
        }
        const next = params.toString();
        navigate(`${location.pathname}${next ? `?${next}` : ""}`, { replace: true });
    };

    return (
        <>
        <div className="page">
            <Group justify="space-between" mb="md">
                <div>
                    <Title order={2}>Your Tasks</Title>
                    <Text c="dimmed">Organize your day with clean focus.</Text>
                </div>
                <Badge size="lg" radius="xl">{filteredTasks.length} tasks</Badge>
            </Group>

            <Group mb="lg" wrap="wrap">
                <Select
                    data={[{ value: "all", label: "All status" }, ...statusOptions]}
                    value={statusFilter}
                    onChange={(value) => setStatusFilter(value || "all")}
                    placeholder="All status"
                />
                <TextInput
                    placeholder="Search tasks"
                    value={search}
                    onChange={(event) => {
                        const value = event.currentTarget.value;
                        setSearch(value);
                        updateQuery(value);
                    }}
                />
            </Group>
            <Text size="sm" c="dimmed" mb="md">
                Tip: click any task card to open the full editor.
            </Text>

            <div className="task-grid">
                <div className="task-board">
                    <Paper className="glass-panel" radius="lg" p="lg" shadow="sm">
                        <Title order={4}>Task labels</Title>
                        <Stack mt="sm">
                            <Group wrap="wrap">
                                <TextInput
                                    placeholder="New label"
                                    value={newLabelName}
                                    onChange={(event) => setNewLabelName(event.currentTarget.value)}
                                />
                                <ColorInput
                                    value={newLabelColor}
                                    onChange={setNewLabelColor}
                                />
                                <Button variant="light" onClick={addLabel}>
                                    Add label
                                </Button>
                            </Group>
                        </Stack>
                    </Paper>
                    <Paper className="glass-panel" radius="lg" p="lg" shadow="sm" mt="md">
                        <Title order={4}>Task columns</Title>
                        <Stack mt="sm">
                            <Group wrap="wrap">
                                <TextInput
                                    placeholder="New column"
                                    value={newColumnName}
                                    onChange={(event) => setNewColumnName(event.currentTarget.value)}
                                />
                                <ColorInput
                                    value={newColumnColor}
                                    onChange={setNewColumnColor}
                                />
                                <Button variant="light" onClick={addColumn}>
                                    Add column
                                </Button>
                            </Group>
                            <Stack gap="xs">
                                {taskColumns.map((column) => (
                                    <Group key={column.key} wrap="wrap">
                                        <TextInput
                                            value={column.name}
                                            onChange={(event) =>
                                                updateColumn(column.key, { name: event.currentTarget.value })
                                            }
                                        />
                                        <ColorInput
                                            value={column.color || "#e9dfcf"}
                                            onChange={(value) => updateColumn(column.key, { color: value })}
                                        />
                                        <Button color="red" variant="light" onClick={() => deleteColumn(column.key)}>
                                            Delete
                                        </Button>
                                    </Group>
                                ))}
                            </Stack>
                        </Stack>
                    </Paper>
                </div>
                <div className="task-board">
                    {error && <Text c="red">{error}</Text>}
                    {loading ? (
                        <Text c="dimmed">Loading...</Text>
                    ) : (
                        <DragDropContext onDragEnd={onDragEnd}>
                            <div className="kanban-scroll">
                                <div className="kanban">
                                    {taskColumns.map((column) => (
                                        <Droppable key={column.key} droppableId={column.key}>
                                            {(provided) => (
                                                <div className="kanban-column" ref={provided.innerRef} {...provided.droppableProps}>
                                                    <Group justify="space-between" mb="sm">
                                                        <Group gap="xs">
                                                            {editingColumnKey === column.key ? (
                                                                <TextInput
                                                                    value={column.name}
                                                                    onChange={(event) =>
                                                                        updateColumn(column.key, { name: event.currentTarget.value })
                                                                    }
                                                                    onBlur={() => setEditingColumnKey(null)}
                                                                />
                                                            ) : (
                                                                <Text
                                                                    fw={600}
                                                                    onClick={() => setEditingColumnKey(column.key)}
                                                                    style={{ color: column.color || "#c7d6cd" }}
                                                                >
                                                                    {column.name}
                                                                </Text>
                                                            )}
                                                            <Button
                                                                size="xs"
                                                                variant="light"
                                                                onClick={() => setQuickAddStatus(column.key)}
                                                            >
                                                                +
                                                            </Button>
                                                        </Group>
                                                        <Badge variant="light">{groupedTasks[column.key]?.length || 0}</Badge>
                                                    </Group>
                                                    {quickAddStatus === column.key && (
                                                        <Group mb="sm" wrap="wrap">
                                                            <TextInput
                                                                placeholder="Quick task title"
                                                                value={quickAddTitle}
                                                                onChange={(event) => setQuickAddTitle(event.currentTarget.value)}
                                                                required
                                                            />
                                                            <Button
                                                                size="xs"
                                                                onClick={() => handleQuickAdd(column.key)}
                                                                loading={quickAddLoading}
                                                            >
                                                                Add
                                                            </Button>
                                                        </Group>
                                                    )}
                                                    <Stack className="kanban-list" gap="sm">
                                                        {(groupedTasks[column.key] || []).map((task, index) => (
                                                            <Draggable key={task._id} draggableId={task._id} index={index}>
                                                {(dragProvided, snapshot) => {
                                                    const card = (
                                                        <Paper
                                                            ref={dragProvided.innerRef}
                                                            {...dragProvided.draggableProps}
                                                            {...dragProvided.dragHandleProps}
                                                            shadow="sm"
                                                            radius="md"
                                                            p="md"
                                                            onClick={() => openTaskModal(task)}
                                                            style={{
                                                                ...dragProvided.draggableProps.style,
                                                                zIndex: snapshot.isDragging ? 9999 : "auto",
                                                                cursor: "pointer"
                                                            }}
                                                        >
                                                            <Stack gap={6}>
                                                                <Group justify="space-between" align="flex-start">
                                                                    <div>
                                                                        <Text fw={600}>{task.title}</Text>
                                                                        {task.description && <Text size="sm">{task.description}</Text>}
                                                                    </div>
                                                                    {columnMeta[task.status] && (
                                                                        <Badge
                                                                            variant="light"
                                                                            style={{
                                                                                color: columnMeta[task.status].color,
                                                                                border: `1px solid ${columnMeta[task.status].color}`
                                                                            }}
                                                                        >
                                                                            {columnMeta[task.status].name}
                                                                        </Badge>
                                                                    )}
                                                                </Group>
                                                                {Array.isArray(task.labels) && task.labels.length > 0 && (
                                                                    <Group gap={6} wrap="wrap">
                                                                        {task.labels.map((label) => (
                                                                            <Badge
                                                                                key={label}
                                                                                variant="light"
                                                                                style={{
                                                                                    color: labelColors[label] || "#c7d6cd",
                                                                                    border: `1px solid ${labelColors[label] || "#c7d6cd"}`
                                                                                }}
                                                                            >
                                                                                {label}
                                                                            </Badge>
                                                                        ))}
                                                                    </Group>
                                                                )}
                                                                <Text size="sm" c="dimmed">
                                                                    Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "None"}
                                                                </Text>
                                                                <Text size="sm" c="dimmed">
                                                                    Time left: {formatTimeLeft(task.dueDate)}
                                                                </Text>
                                                                <Group>
                                                                    <Button
                                                                        size="xs"
                                                                        color="red"
                                                                        onClick={(event) => {
                                                                            event.stopPropagation();
                                                                            handleDelete(task._id);
                                                                        }}
                                                                    >
                                                                        Delete
                                                                    </Button>
                                                                </Group>
                                                            </Stack>
                                                        </Paper>
                                                    );
                                                    if (snapshot.isDragging) {
                                                        return createPortal(card, document.body);
                                                    }
                                                    return card;
                                                }}
                                            </Draggable>
                                                        ))}
                                                        {provided.placeholder}
                                                    </Stack>
                                                </div>
                                            )}
                                        </Droppable>
                                    ))}
                                </div>
                            </div>
                        </DragDropContext>
                    )}
                </div>
                <div className="task-board">
                    <Paper className="sticky glass-panel" radius="lg" p="lg" shadow="sm">
                        <Title order={4}>Create task</Title>
                        <form onSubmit={handleCreate}>
                            <Stack mt="sm">
                                <TextInput
                                    placeholder="Task title"
                                    value={title}
                                    onChange={(event) => setTitle(event.currentTarget.value)}
                                    required
                                />
                                <Textarea
                                    placeholder="Short description"
                                    value={description}
                                    onChange={(event) => setDescription(event.currentTarget.value)}
                                    minRows={3}
                                />
                                <Select
                                    data={statusOptions}
                                    value={status}
                                    onChange={(value) => setStatus(value || "")}
                                />
                                <MultiSelect
                                    data={labelOptions}
                                    value={labels}
                                    onChange={setLabels}
                                    placeholder="Labels"
                                />
                                <TextInput
                                    type="date"
                                    value={dueDate}
                                    onChange={(event) => setDueDate(event.currentTarget.value)}
                                />
                                <Button type="submit">Add task</Button>
                            </Stack>
                        </form>
                    </Paper>
                </div>
            </div>
        </div>
        {isModalOpen && (
            <div className="modal-overlay" onClick={cancelEdit}>
                <div className="modal-card glass-panel" onClick={(event) => event.stopPropagation()}>
                    <Title order={4}>Edit task</Title>
                    <form onSubmit={handleUpdate}>
                        <Stack mt="sm">
                            <TextInput
                                value={editTitle}
                                onChange={(event) => setEditTitle(event.currentTarget.value)}
                                placeholder="Task title"
                                required
                            />
                            <Textarea
                                value={editDescription}
                                onChange={(event) => setEditDescription(event.currentTarget.value)}
                                minRows={3}
                                placeholder="Short description"
                            />
                            <Group wrap="wrap">
                                <Select
                                    data={statusOptions}
                                    value={editStatus}
                                    onChange={(value) => setEditStatus(value || "")}
                                />
                                <MultiSelect
                                    data={labelOptions}
                                    value={editLabels}
                                    onChange={setEditLabels}
                                    placeholder="Labels"
                                />
                                <TextInput
                                    type="date"
                                    value={editDueDate}
                                    onChange={(event) => setEditDueDate(event.currentTarget.value)}
                                />
                            </Group>
                            <Group>
                                <Button type="submit">Save</Button>
                                <Button variant="light" onClick={cancelEdit}>
                                    Cancel
                                </Button>
                            </Group>
                        </Stack>
                    </form>
                </div>
            </div>
        )}
        </>
    );
};

export default Tasks;
