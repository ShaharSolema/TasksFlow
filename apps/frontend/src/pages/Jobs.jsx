
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

const Jobs = () => {
    const [jobs, setJobs] = useState([]);
    const routeLocation = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [company, setCompany] = useState("");
    const [title, setTitle] = useState("");
    const [status, setStatus] = useState("");
    const [jobType, setJobType] = useState("full-time");
    const [labels, setLabels] = useState([]);
    const [priority, setPriority] = useState("medium");
    const [location, setLocation] = useState("");
    const [link, setLink] = useState("");
    const [expectedSalary, setExpectedSalary] = useState("");
    const [salaryCurrency, setSalaryCurrency] = useState("USD");
    const [notes, setNotes] = useState("");
    const [appliedDate, setAppliedDate] = useState("");
    const [nextInterviewDate, setNextInterviewDate] = useState("");
    const [followUpDate, setFollowUpDate] = useState("");
    const [reminders, setReminders] = useState([]);
    const [reminderDate, setReminderDate] = useState("");
    const [reminderNote, setReminderNote] = useState("");

    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");

    const [jobLabels, setJobLabels] = useState([]);
    const [jobColumns, setJobColumns] = useState([]);
    const [editingColumnKey, setEditingColumnKey] = useState(null);
    const [newLabelName, setNewLabelName] = useState("");
    const [newLabelColor, setNewLabelColor] = useState("#6a8c7d");
    const [newColumnName, setNewColumnName] = useState("");
    const [newColumnColor, setNewColumnColor] = useState("#e9dfcf");
    const [quickAddStatus, setQuickAddStatus] = useState(null);
    const [quickAddTitle, setQuickAddTitle] = useState("");
    const [quickAddLoading, setQuickAddLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isColumnsModalOpen, setIsColumnsModalOpen] = useState(false);

    // Simple fetch helper to keep the requests readable.
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

    const loadJobs = async () => {
        try {
            setLoading(true);
            const data = await fetchJson("/api/jobs");
            setJobs(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message || "Failed to load jobs.");
        } finally {
            setLoading(false);
        }
    };

    const loadTags = async () => {
        try {
            const data = await fetchJson("/api/tags/job");
            setJobLabels(data.labels || []);
        } catch (err) {
            setError(err.message || "Failed to load labels.");
        }
    };

    const loadColumns = async () => {
        try {
            const data = await fetchJson("/api/columns/job");
            setJobColumns(data.columns || []);
            if (data.columns && data.columns.length > 0 && !status) {
                setStatus(data.columns[0].key);
            }
        } catch (err) {
            setError(err.message || "Failed to load columns.");
        }
    };

    useEffect(() => {
        loadJobs();
        loadTags();
        loadColumns();
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(routeLocation.search);
        const value = params.get("q") || "";
        setSearch((prev) => (prev === value ? prev : value));
    }, [routeLocation.search]);

    const filteredJobs = jobs.filter((job) => {
        const statusMatch = statusFilter === "all" || job.status === statusFilter;
        const typeMatch = typeFilter === "all" || job.jobType === typeFilter;
        const priorityMatch = priorityFilter === "all" || job.priority === priorityFilter;
        const searchMatch =
            !search ||
            job.company.toLowerCase().includes(search.toLowerCase()) ||
            job.title.toLowerCase().includes(search.toLowerCase()) ||
            (job.notes || "").toLowerCase().includes(search.toLowerCase());
        return statusMatch && typeMatch && priorityMatch && searchMatch;
    });

    const groupedJobs = useMemo(() => {
        const base = {};
        jobColumns.forEach((col) => {
            base[col.key] = [];
        });
        for (const job of filteredJobs) {
            if (base[job.status]) {
                base[job.status].push(job);
            }
        }
        return base;
    }, [filteredJobs, jobColumns]);

    // Move jobs locally first, then sync their order.
    const onDragEnd = async (result) => {
        if (!result.destination) return;
        const { destination, draggableId, source } = result;
        const nextStatus = destination.droppableId;
        const job = jobs.find((item) => item._id === draggableId);
        if (!job) return;
        const previousJobs = jobs;
        const jobColumnsOrder = jobColumns.map((col) => col.key);
        const withoutJob = jobs.filter((item) => item._id !== draggableId);
        const columnsMap = {};
        jobColumnsOrder.forEach((key) => {
            columnsMap[key] = [];
        });
        withoutJob.forEach((item) => {
            if (!columnsMap[item.status]) {
                columnsMap[item.status] = [];
            }
            columnsMap[item.status].push(item);
        });
        const destinationJobs = columnsMap[nextStatus] || [];
        const movedJob = { ...job, status: nextStatus };
        const insertIndex = Math.max(0, Math.min(destination.index, destinationJobs.length));
        destinationJobs.splice(insertIndex, 0, movedJob);
        columnsMap[nextStatus] = destinationJobs;
        const updatedJobs = [];
        jobColumnsOrder.forEach((key) => {
            if (columnsMap[key]) {
                updatedJobs.push(...columnsMap[key]);
            }
        });
        setJobs(updatedJobs);
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
                    fetch(`${API_BASE}/api/jobs/${item.id}`, {
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
                throw new Error(data.message || "Failed to update job.");
            }
        } catch (err) {
            setJobs(previousJobs);
            setError(err.message || "Failed to update job.");
        }
    };

    const addReminder = () => {
        if (!reminderDate) return;
        setReminders((prev) => [
            ...prev,
            { date: reminderDate, note: reminderNote, done: false }
        ]);
        setReminderDate("");
        setReminderNote("");
    };

    const handleCreate = async (event) => {
        event.preventDefault();
        setError("");
        try {
            await fetchJson("/api/jobs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    company: company.trim() || undefined,
                    title,
                    status,
                    jobType,
                    labels,
                    priority,
                    location,
                    link,
                    expectedSalary: expectedSalary ? Number(expectedSalary) : undefined,
                    salaryCurrency,
                    notes,
                    appliedDate: appliedDate || undefined,
                    nextInterviewDate: nextInterviewDate || undefined,
                    followUpDate: followUpDate || undefined,
                    reminders
                })
            });
            setCompany("");
            setTitle("");
            setStatus(jobColumns[0]?.key || "");
            setJobType("full-time");
            setLabels([]);
            setPriority("medium");
            setLocation("");
            setLink("");
            setExpectedSalary("");
            setSalaryCurrency("USD");
            setNotes("");
            setAppliedDate("");
            setNextInterviewDate("");
            setFollowUpDate("");
            setReminders([]);
            await loadJobs();
        } catch (err) {
            setError(err.message || "Failed to create job.");
        }
    };

    const handleQuickAdd = async (statusKey) => {
        const titleValue = quickAddTitle.trim();
        if (!titleValue) return;
        setQuickAddLoading(true);
        try {
            await fetchJson("/api/jobs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: titleValue,
                    status: statusKey
                })
            });
            setQuickAddTitle("");
            setQuickAddStatus(null);
            await loadJobs();
        } catch (err) {
            setError(err.message || "Failed to create job.");
        } finally {
            setQuickAddLoading(false);
        }
    };

    const startEdit = (job) => {
        setEditingId(job._id);
        setEditData({
            company: job.company || "",
            title: job.title || "",
            status: job.status || "",
            jobType: job.jobType || "full-time",
            labels: job.labels || [],
            priority: job.priority || "medium",
            location: job.location || "",
            link: job.link || "",
            expectedSalary: job.expectedSalary || "",
            salaryCurrency: job.salaryCurrency || "USD",
            notes: job.notes || "",
            appliedDate: job.appliedDate ? job.appliedDate.slice(0, 10) : "",
            nextInterviewDate: job.nextInterviewDate ? job.nextInterviewDate.slice(0, 10) : "",
            followUpDate: job.followUpDate ? job.followUpDate.slice(0, 10) : "",
            reminders: job.reminders || []
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditData({});
        setIsModalOpen(false);
    };

    const openJobModal = (job) => {
        startEdit(job);
        setIsModalOpen(true);
    };

    const handleUpdate = async (event) => {
        event.preventDefault();
        if (!editingId) return;
        setError("");
        try {
            const payload = {
                ...editData,
                expectedSalary: editData.expectedSalary ? Number(editData.expectedSalary) : undefined,
                appliedDate: editData.appliedDate || undefined,
                nextInterviewDate: editData.nextInterviewDate || undefined,
                followUpDate: editData.followUpDate || undefined
            };
            await fetchJson(`/api/jobs/${editingId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            await loadJobs();
            cancelEdit();
        } catch (err) {
            setError(err.message || "Failed to update job.");
        }
    };

    const handleDelete = async (jobId) => {
        setError("");
        try {
            await fetchJson(`/api/jobs/${jobId}`, {
                method: "DELETE"
            });
            await loadJobs();
        } catch (err) {
            setError(err.message || "Failed to delete job.");
        }
    };

    const estimateSalary = async () => {
        setError("");
        if (!title) {
            setError("Add a title before estimating salary.");
            return;
        }
        try {
            const params = new URLSearchParams();
            params.set("title", title);
            if (location) params.set("location", location);
            if (jobType) params.set("jobType", jobType);
            const payload = await fetchJson(`/api/jobs/estimate-salary?${params.toString()}`);
            if (payload.estimate) {
                setExpectedSalary(payload.estimate);
                setSalaryCurrency(payload.currency || "USD");
            } else {
                setError("Salary API returned no estimate.");
            }
        } catch (err) {
            setError(err.message || "Failed to estimate salary.");
        }
    };

    const labelOptions = useMemo(
        () => jobLabels.map((item) => ({ value: item.name, label: item.name })),
        [jobLabels]
    );

    const labelColors = useMemo(() => {
        const map = {};
        jobLabels.forEach((item) => {
            map[item.name] = item.color || "#c7d6cd";
        });
        return map;
    }, [jobLabels]);

    const statusOptions = useMemo(
        () => jobColumns.map((col) => ({ value: col.key, label: col.name })),
        [jobColumns]
    );

    const columnMeta = useMemo(() => {
        const map = {};
        jobColumns.forEach((col) => {
            map[col.key] = { name: col.name, color: col.color || "#c7d6cd" };
        });
        return map;
    }, [jobColumns]);

    const addLabel = async () => {
        if (!newLabelName.trim()) return;
        try {
            const data = await fetchJson("/api/tags/job/labels", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newLabelName, color: newLabelColor })
            });
            setJobLabels(data.labels || []);
            setNewLabelName("");
        } catch (err) {
            setError(err.message || "Failed to add label.");
        }
    };

    const addColumn = async () => {
        if (!newColumnName.trim()) return;
        try {
            const data = await fetchJson("/api/columns/job", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newColumnName, color: newColumnColor })
            });
            setJobColumns(data.columns || []);
            setNewColumnName("");
        } catch (err) {
            setError(err.message || "Failed to add column.");
        }
    };

    const updateColumn = async (columnKey, updates) => {
        try {
            const data = await fetchJson(`/api/columns/job/${columnKey}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates)
            });
            setJobColumns(data.columns || []);
        } catch (err) {
            setError(err.message || "Failed to update column.");
        }
    };

    const reorderColumns = async (nextColumns) => {
        try {
            const data = await fetchJson("/api/columns/job", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ order: nextColumns.map((col) => col.key) })
            });
            setJobColumns(data.columns || []);
        } catch (err) {
            setError(err.message || "Failed to reorder columns.");
        }
    };

    const moveColumn = (index, direction) => {
        const nextIndex = index + direction;
        if (nextIndex < 0 || nextIndex >= jobColumns.length) return;
        const next = [...jobColumns];
        const temp = next[index];
        next[index] = next[nextIndex];
        next[nextIndex] = temp;
        setJobColumns(next);
        reorderColumns(next);
    };

    const deleteColumn = async (columnKey) => {
        try {
            const data = await fetchJson(`/api/columns/job/${columnKey}`, {
                method: "DELETE"
            });
            setJobColumns(data.columns || []);
        } catch (err) {
            setError(err.message || "Failed to delete column.");
        }
    };

    const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : "None");
    const updateQuery = (value) => {
        const params = new URLSearchParams(routeLocation.search);
        if (value) {
            params.set("q", value);
        } else {
            params.delete("q");
        }
        const next = params.toString();
        navigate(`${routeLocation.pathname}${next ? `?${next}` : ""}`, { replace: true });
    };
    return (
        <>
        <div className="page">
            <Group justify="space-between" mb="md">
                <div>
                    <Title order={2}>Job Tracker</Title>
                    <Text c="dimmed">Track applications, interviews, and offers.</Text>
                </div>
                <Group>
                    <Badge size="lg" radius="xl">{filteredJobs.length} jobs</Badge>
                    <Button variant="light" onClick={() => setIsColumnsModalOpen(true)}>
                        Edit columns
                    </Button>
                </Group>
            </Group>

            <Group mb="lg" wrap="wrap">
                <Select
                    data={[{ value: "all", label: "All status" }, ...statusOptions]}
                    value={statusFilter}
                    onChange={(value) => setStatusFilter(value || "all")}
                    withinPortal
                />
                <Select
                    data={[
                        { value: "all", label: "All types" },
                        { value: "full-time", label: "Full-time" },
                        { value: "part-time", label: "Part-time" },
                        { value: "contract", label: "Contract" },
                        { value: "internship", label: "Internship" },
                        { value: "freelance", label: "Freelance" }
                    ]}
                    value={typeFilter}
                    onChange={(value) => setTypeFilter(value || "all")}
                    withinPortal
                />
                <Select
                    data={[
                        { value: "all", label: "All priorities" },
                        { value: "low", label: "Low" },
                        { value: "medium", label: "Medium" },
                        { value: "high", label: "High" }
                    ]}
                    value={priorityFilter}
                    onChange={(value) => setPriorityFilter(value || "all")}
                    withinPortal
                />
                <TextInput
                    placeholder="Search jobs"
                    value={search}
                    onChange={(event) => {
                        const value = event.currentTarget.value;
                        setSearch(value);
                        updateQuery(value);
                    }}
                />
            </Group>
            <Text size="sm" c="dimmed" mb="md">
                Tip: click any job card to open the full editor.
            </Text>

            <DragDropContext onDragEnd={onDragEnd}>
            <div className="task-grid task-grid--wide">
                <div className="task-board">
                    {error && <Text c="red">{error}</Text>}
                    {loading ? (
                        <Text c="dimmed">Loading...</Text>
                    ) : (
                        <div className="kanban-scroll">
                            <div className="kanban">
                                {jobColumns.map((column) => (
                                    <div className="kanban-column" key={column.key}>
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
                                            <Badge variant="light">{groupedJobs[column.key]?.length || 0}</Badge>
                                        </Group>
                                        {quickAddStatus === column.key && (
                                            <Group mb="sm" wrap="wrap">
                                                <TextInput
                                                    placeholder="Quick job title"
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
                                        <Droppable droppableId={column.key}>
                                            {(jobProvided) => (
                                                <div
                                                    className="kanban-dropzone"
                                                    ref={jobProvided.innerRef}
                                                    {...jobProvided.droppableProps}
                                                >
                                                    <Stack className="kanban-list" gap="sm">
                                                        {(groupedJobs[column.key] || []).map((job, index) => (
                                                            <Draggable key={job._id} draggableId={job._id} index={index}>
                                                                {(dragProvided, snapshot) => {
                                                                    const card = (
                                                                        <Paper
                                                                            className={snapshot.isDragging ? "kanban-card is-dragging" : "kanban-card"}
                                                                            ref={dragProvided.innerRef}
                                                                            {...dragProvided.draggableProps}
                                                                            {...dragProvided.dragHandleProps}
                                                                            shadow="sm"
                                                                            radius="md"
                                                                            p="md"
                                                                            onClick={() => openJobModal(job)}
                                                                            style={{
                                                                                ...dragProvided.draggableProps.style,
                                                                                zIndex: snapshot.isDragging ? 9999 : "auto",
                                                                                cursor: "pointer"
                                                                            }}
                                                                        >
                                                                            <Stack gap={6}>
                                                                                <Group justify="space-between" align="flex-start">
                                                                                    <div>
                                                                                        <Text fw={600}>{job.title}</Text>
                                                                                        <Text size="sm" c="dimmed">{job.company}</Text>
                                                                                    </div>
                                                                                    {columnMeta[job.status] && (
                                                                                        <Badge
                                                                                            variant="light"
                                                                                            style={{
                                                                                                color: columnMeta[job.status].color,
                                                                                                border: `1px solid ${columnMeta[job.status].color}`
                                                                                            }}
                                                                                        >
                                                                                            {columnMeta[job.status].name}
                                                                                        </Badge>
                                                                                    )}
                                                                                </Group>
                                                                                {Array.isArray(job.labels) && job.labels.length > 0 && (
                                                                                    <Group gap={6} wrap="wrap">
                                                                                        {job.labels.map((label) => (
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
                                                                                    Priority: {job.priority} - Applied: {formatDate(job.appliedDate)}
                                                                                </Text>
                                                                                <Text size="sm" c="dimmed">
                                                                                    Interview: {formatDate(job.nextInterviewDate)} - Follow up: {formatDate(job.followUpDate)}
                                                                                </Text>
                                                                                {job.expectedSalary && (
                                                                                    <Text size="sm" c="dimmed">
                                                                                        Expected: {job.expectedSalary} {job.salaryCurrency}
                                                                                    </Text>
                                                                                )}
                                                                                <Group>
                                                                                    <Button
                                                                                        size="xs"
                                                                                        color="red"
                                                                                        onClick={(event) => {
                                                                                            event.stopPropagation();
                                                                                            handleDelete(job._id);
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
                                                        {jobProvided.placeholder}
                                                    </Stack>
                                                </div>
                                            )}
                                        </Droppable>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="task-board">
                    <Paper className="sticky glass-panel" radius="lg" p="lg" shadow="sm">
                        <Title order={4}>Add job</Title>
                        <form onSubmit={handleCreate}>
                            <Stack mt="sm">
                                <TextInput placeholder="Company" value={company} onChange={(e) => setCompany(e.currentTarget.value)} />
                                <TextInput placeholder="Role / Title" value={title} onChange={(e) => setTitle(e.currentTarget.value)} required />
                                <Group wrap="wrap">
                                <Select data={statusOptions} value={status} onChange={(value) => setStatus(value || "")} withinPortal />
                                    <Select
                                        data={[
                                            { value: "full-time", label: "Full-time" },
                                            { value: "part-time", label: "Part-time" },
                                            { value: "contract", label: "Contract" },
                                            { value: "internship", label: "Internship" },
                                            { value: "freelance", label: "Freelance" }
                                        ]}
                                        value={jobType}
                                        onChange={(value) => setJobType(value || "full-time")}
                                        withinPortal
                                    />
                                    <Select
                                        data={[
                                            { value: "low", label: "Low" },
                                            { value: "medium", label: "Medium" },
                                            { value: "high", label: "High" }
                                        ]}
                                        value={priority}
                                        onChange={(value) => setPriority(value || "medium")}
                                        withinPortal
                                    />
                                </Group>
                                <MultiSelect
                                    data={labelOptions}
                                    value={labels}
                                    onChange={setLabels}
                                    placeholder="Labels"
                                    withinPortal
                                />
                                <TextInput placeholder="Location" value={location} onChange={(e) => setLocation(e.currentTarget.value)} />
                                <TextInput placeholder="Job link" value={link} onChange={(e) => setLink(e.currentTarget.value)} />
                                <Group wrap="wrap">
                                    <TextInput placeholder="Expected salary" value={expectedSalary} onChange={(e) => setExpectedSalary(e.currentTarget.value)} />
                                    <TextInput placeholder="Currency" value={salaryCurrency} onChange={(e) => setSalaryCurrency(e.currentTarget.value)} />
                                    <Button variant="light" onClick={estimateSalary}>AI salary</Button>
                                </Group>
                                <Textarea minRows={3} placeholder="Notes" value={notes} onChange={(e) => setNotes(e.currentTarget.value)} />
                                <Group wrap="wrap">
                                    <Text size="sm" c="dimmed">Applied</Text>
                                    <TextInput type="date" value={appliedDate} onChange={(e) => setAppliedDate(e.currentTarget.value)} />
                                    <Text size="sm" c="dimmed">Interview</Text>
                                    <TextInput type="date" value={nextInterviewDate} onChange={(e) => setNextInterviewDate(e.currentTarget.value)} />
                                </Group>
                                <Group wrap="wrap">
                                    <Text size="sm" c="dimmed">Follow up</Text>
                                    <TextInput type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.currentTarget.value)} />
                                </Group>
                                <Paper radius="md" p="sm" withBorder>
                                    <Title order={5}>Reminders</Title>
                                    <Group mt="xs" wrap="wrap">
                                        <TextInput type="date" value={reminderDate} onChange={(e) => setReminderDate(e.currentTarget.value)} />
                                        <TextInput placeholder="Reminder note" value={reminderNote} onChange={(e) => setReminderNote(e.currentTarget.value)} />
                                        <Button variant="light" onClick={addReminder}>Add</Button>
                                    </Group>
                                    {reminders.length > 0 && (
                                        <Stack mt="xs" gap={4}>
                                            {reminders.map((item, index) => (
                                                <Text key={`${item.date}-${index}`} size="sm" c="dimmed">
                                                    {item.date} {item.note ? `- ${item.note}` : ""}
                                                </Text>
                                            ))}
                                        </Stack>
                                    )}
                                </Paper>
                                <Button type="submit">Save job</Button>
                            </Stack>
                        </form>
                    </Paper>
                </div>
            </div>
            </DragDropContext>
        </div>
        {isColumnsModalOpen && (
            <div className="modal-overlay" onClick={() => setIsColumnsModalOpen(false)}>
                <div className="modal-card glass-panel" onClick={(event) => event.stopPropagation()}>
                    <div className="modal-scroll">
                        <Title order={4}>Edit job columns</Title>
                        <Stack mt="sm">
                        <Title order={5}>Job labels</Title>
                        <Group wrap="wrap" className="portal-popover">
                            <TextInput
                                placeholder="New label"
                                value={newLabelName}
                                onChange={(event) => setNewLabelName(event.currentTarget.value)}
                            />
                            <ColorInput
                                value={newLabelColor}
                                onChange={setNewLabelColor}
                                withinPortal
                            />
                            <Button variant="light" onClick={addLabel}>
                                Add label
                            </Button>
                        </Group>
                        <Title order={5}>Job columns</Title>
                        <Group wrap="wrap" className="portal-popover">
                            <TextInput
                                placeholder="New column"
                                value={newColumnName}
                                onChange={(event) => setNewColumnName(event.currentTarget.value)}
                            />
                            <ColorInput
                                value={newColumnColor}
                                onChange={setNewColumnColor}
                                withinPortal
                            />
                            <Button variant="light" onClick={addColumn}>
                                Add column
                            </Button>
                        </Group>
                        <Stack gap="xs">
                            {jobColumns.map((column, index) => (
                                <Group key={column.key} className="column-edit-row" wrap="nowrap">
                                    <TextInput
                                        value={column.name}
                                        onChange={(event) =>
                                            updateColumn(column.key, { name: event.currentTarget.value })
                                        }
                                    />
                                    <ColorInput
                                        value={column.color || "#e9dfcf"}
                                        onChange={(value) => updateColumn(column.key, { color: value })}
                                        withinPortal
                                    />
                                    <Button variant="light" onClick={() => moveColumn(index, -1)}>
                                        Up
                                    </Button>
                                    <Button variant="light" onClick={() => moveColumn(index, 1)}>
                                        Down
                                    </Button>
                                    <Button color="red" variant="light" onClick={() => deleteColumn(column.key)}>
                                        Delete
                                    </Button>
                                </Group>
                            ))}
                        </Stack>
                        <Group justify="flex-end">
                            <Button variant="light" onClick={() => setIsColumnsModalOpen(false)}>
                                Close
                            </Button>
                        </Group>
                        </Stack>
                    </div>
                </div>
            </div>
        )}
        {isModalOpen && (
            <div className="modal-overlay" onClick={cancelEdit}>
                <div className="modal-card glass-panel" onClick={(event) => event.stopPropagation()}>
                    <div className="modal-scroll">
                        <Title order={4}>Edit job</Title>
                        <form onSubmit={handleUpdate}>
                            <Stack mt="sm">
                            <TextInput
                                value={editData.company || ""}
                                onChange={(event) =>
                                    setEditData((prev) => ({
                                        ...prev,
                                        company: event.currentTarget.value
                                    }))
                                }
                                placeholder="Company"
                            />
                            <TextInput
                                value={editData.title || ""}
                                onChange={(event) =>
                                    setEditData((prev) => ({
                                        ...prev,
                                        title: event.currentTarget.value
                                    }))
                                }
                                placeholder="Role / Title"
                                required
                            />
                            <Textarea
                                value={editData.notes || ""}
                                onChange={(event) =>
                                    setEditData((prev) => ({
                                        ...prev,
                                        notes: event.currentTarget.value
                                    }))
                                }
                                minRows={3}
                                placeholder="Notes"
                            />
                            <Group wrap="wrap">
                                <Select
                                    data={statusOptions}
                                    value={editData.status}
                                    onChange={(value) =>
                                        setEditData((prev) => ({
                                            ...prev,
                                            status: value || ""
                                        }))
                                    }
                                    withinPortal
                                />
                                <Select
                                    data={[
                                        { value: "full-time", label: "Full-time" },
                                        { value: "part-time", label: "Part-time" },
                                        { value: "contract", label: "Contract" },
                                        { value: "internship", label: "Internship" },
                                        { value: "freelance", label: "Freelance" }
                                    ]}
                                    value={editData.jobType}
                                    onChange={(value) =>
                                        setEditData((prev) => ({
                                            ...prev,
                                            jobType: value || "full-time"
                                        }))
                                    }
                                    withinPortal
                                />
                                <Select
                                    data={[
                                        { value: "low", label: "Low" },
                                        { value: "medium", label: "Medium" },
                                        { value: "high", label: "High" }
                                    ]}
                                    value={editData.priority}
                                    onChange={(value) =>
                                        setEditData((prev) => ({
                                            ...prev,
                                            priority: value || "medium"
                                        }))
                                    }
                                    withinPortal
                                />
                                <MultiSelect
                                    data={labelOptions}
                                    value={editData.labels || []}
                                    onChange={(value) =>
                                        setEditData((prev) => ({
                                            ...prev,
                                            labels: value
                                        }))
                                    }
                                    placeholder="Labels"
                                    withinPortal
                                />
                            </Group>
                            <Group wrap="wrap">
                                <TextInput
                                    type="date"
                                    label="Applied"
                                    value={editData.appliedDate || ""}
                                    onChange={(event) =>
                                        setEditData((prev) => ({
                                            ...prev,
                                            appliedDate: event.currentTarget.value
                                        }))
                                    }
                                />
                                <TextInput
                                    type="date"
                                    label="Interview"
                                    value={editData.nextInterviewDate || ""}
                                    onChange={(event) =>
                                        setEditData((prev) => ({
                                            ...prev,
                                            nextInterviewDate: event.currentTarget.value
                                        }))
                                    }
                                />
                                <TextInput
                                    type="date"
                                    label="Follow up"
                                    value={editData.followUpDate || ""}
                                    onChange={(event) =>
                                        setEditData((prev) => ({
                                            ...prev,
                                            followUpDate: event.currentTarget.value
                                        }))
                                    }
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
            </div>
        )}
        </>
    );
};

export default Jobs;
