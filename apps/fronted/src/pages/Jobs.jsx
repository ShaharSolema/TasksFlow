
import { useEffect, useMemo, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { API_BASE } from "../lib/api.js";

const STATUS_ORDER = ["saved", "applied", "interview", "offer", "rejected"];

const Jobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [company, setCompany] = useState("");
    const [title, setTitle] = useState("");
    const [status, setStatus] = useState("saved");
    const [jobType, setJobType] = useState("full-time");
    const [category, setCategory] = useState("");
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

    const loadJobs = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE}/api/jobs`, { credentials: "include" });
            if (!response.ok) {
                const body = await response.json().catch(() => ({}));
                throw new Error(body.message || "Failed to load jobs.");
            }
            const data = await response.json();
            setJobs(data || []);
        } catch (err) {
            setError(err.message || "Failed to load jobs.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadJobs();
    }, []);

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
        const base = {
            saved: [],
            applied: [],
            interview: [],
            offer: [],
            rejected: []
        };
        for (const job of filteredJobs) {
            if (base[job.status]) {
                base[job.status].push(job);
            }
        }
        return base;
    }, [filteredJobs]);

    const onDragEnd = async (result) => {
        if (!result.destination) return;
        const { destination, draggableId } = result;
        const nextStatus = destination.droppableId;
        const job = jobs.find((item) => item._id === draggableId);
        if (!job || job.status === nextStatus) return;
        try {
            const response = await fetch(`${API_BASE}/api/jobs/${draggableId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ status: nextStatus })
            });
            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.message || "Failed to update job.");
            }
            await loadJobs();
        } catch (err) {
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
            const response = await fetch(`${API_BASE}/api/jobs`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    company,
                    title,
                    status,
                    jobType,
                    category,
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
            if (!response.ok) {
                const body = await response.json().catch(() => ({}));
                throw new Error(body.message || "Failed to create job.");
            }
            setCompany("");
            setTitle("");
            setStatus("saved");
            setJobType("full-time");
            setCategory("");
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

    const startEdit = (job) => {
        setEditingId(job._id);
        setEditData({
            company: job.company || "",
            title: job.title || "",
            status: job.status || "saved",
            jobType: job.jobType || "full-time",
            category: job.category || "",
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
            const response = await fetch(`${API_BASE}/api/jobs/${editingId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                const body = await response.json().catch(() => ({}));
                throw new Error(body.message || "Failed to update job.");
            }
            await loadJobs();
            cancelEdit();
        } catch (err) {
            setError(err.message || "Failed to update job.");
        }
    };

    const handleDelete = async (jobId) => {
        setError("");
        try {
            const response = await fetch(`${API_BASE}/api/jobs/${jobId}`, {
                method: "DELETE",
                credentials: "include"
            });
            if (!response.ok) {
                const body = await response.json().catch(() => ({}));
                throw new Error(body.message || "Failed to delete job.");
            }
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
            const url = new URL(`${API_BASE}/api/jobs/estimate-salary`);
            url.searchParams.set("title", title);
            if (location) url.searchParams.set("location", location);
            if (jobType) url.searchParams.set("jobType", jobType);
            const response = await fetch(url.toString(), { credentials: "include" });
            if (!response.ok) {
                const body = await response.json().catch(() => ({}));
                throw new Error(body.message || "Failed to estimate salary.");
            }
            const payload = await response.json();
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

    const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : "None");
    return (
        <div className="page">
            <div className="hero">
                <div>
                    <h1>Job Tracker</h1>
                    <p className="muted">Track applications, interviews, and offers.</p>
                </div>
                <span className="badge">{filteredJobs.length} jobs</span>
            </div>

            <div className="task-grid">
                <div className="task-board">
                    {error && <p className="error">{error}</p>}
                    {loading ? (
                        <p className="muted">Loading...</p>
                    ) : (
                        <DragDropContext onDragEnd={onDragEnd}>
                            <div className="kanban">
                                {STATUS_ORDER.map((statusKey) => (
                                    <Droppable key={statusKey} droppableId={statusKey}>
                                        {(provided) => (
                                            <div className="kanban-column" ref={provided.innerRef} {...provided.droppableProps}>
                                                <div className="kanban-header">
                                                    <h3>{statusKey.replace("-", " ")}</h3>
                                                    <span className="badge">{groupedJobs[statusKey].length}</span>
                                                </div>
                                                <div className="kanban-list">
                                                    {groupedJobs[statusKey].map((job, index) => (
                                                        <Draggable key={job._id} draggableId={job._id} index={index}>
                                                            {(dragProvided) => (
                                                                <div
                                                                    className="card task-card"
                                                                    ref={dragProvided.innerRef}
                                                                    {...dragProvided.draggableProps}
                                                                    {...dragProvided.dragHandleProps}
                                                                >
                                                                    {editingId === job._id ? (
                                                                        <form onSubmit={handleUpdate}>
                                                                            <div className="form-grid">
                                                                                <input
                                                                                    type="text"
                                                                                    value={editData.company || ""}
                                                                                    onChange={(event) =>
                                                                                        setEditData((prev) => ({
                                                                                            ...prev,
                                                                                            company: event.target.value
                                                                                        }))
                                                                                    }
                                                                                    className="input"
                                                                                    placeholder="Company"
                                                                                    required
                                                                                />
                                                                                <input
                                                                                    type="text"
                                                                                    value={editData.title || ""}
                                                                                    onChange={(event) =>
                                                                                        setEditData((prev) => ({
                                                                                            ...prev,
                                                                                            title: event.target.value
                                                                                        }))
                                                                                    }
                                                                                    className="input"
                                                                                    placeholder="Role"
                                                                                    required
                                                                                />
                                                                                <textarea
                                                                                    value={editData.notes || ""}
                                                                                    onChange={(event) =>
                                                                                        setEditData((prev) => ({
                                                                                            ...prev,
                                                                                            notes: event.target.value
                                                                                        }))
                                                                                    }
                                                                                    className="textarea"
                                                                                    rows={3}
                                                                                />
                                                                                <div className="row">
                                                                                    <select
                                                                                        value={editData.status}
                                                                                        onChange={(event) =>
                                                                                            setEditData((prev) => ({
                                                                                                ...prev,
                                                                                                status: event.target.value
                                                                                            }))
                                                                                        }
                                                                                        className="select"
                                                                                    >
                                                                                        {STATUS_ORDER.map((value) => (
                                                                                            <option key={value} value={value}>
                                                                                                {value}
                                                                                            </option>
                                                                                        ))}
                                                                                    </select>
                                                                                    <select
                                                                                        value={editData.jobType}
                                                                                        onChange={(event) =>
                                                                                            setEditData((prev) => ({
                                                                                                ...prev,
                                                                                                jobType: event.target.value
                                                                                            }))
                                                                                        }
                                                                                        className="select"
                                                                                    >
                                                                                        <option value="full-time">Full-time</option>
                                                                                        <option value="part-time">Part-time</option>
                                                                                        <option value="contract">Contract</option>
                                                                                        <option value="internship">Internship</option>
                                                                                        <option value="freelance">Freelance</option>
                                                                                    </select>
                                                                                    <select
                                                                                        value={editData.priority}
                                                                                        onChange={(event) =>
                                                                                            setEditData((prev) => ({
                                                                                                ...prev,
                                                                                                priority: event.target.value
                                                                                            }))
                                                                                        }
                                                                                        className="select"
                                                                                    >
                                                                                        <option value="low">Low</option>
                                                                                        <option value="medium">Medium</option>
                                                                                        <option value="high">High</option>
                                                                                    </select>
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
                                                                                <div>
                                                                                    <h4 className="task-title">{job.title}</h4>
                                                                                    <p className="muted">{job.company}</p>
                                                                                </div>
                                                                                <span className="pill category-pill">{job.jobType}</span>
                                                                            </div>
                                                                            {job.category && <p className="muted">Category: {job.category}</p>}
                                                                            <div className="task-meta">
                                                                                <span>Priority: {job.priority}</span>
                                                                                <span>Applied: {formatDate(job.appliedDate)}</span>
                                                                            </div>
                                                                            <div className="task-meta">
                                                                                <span>Interview: {formatDate(job.nextInterviewDate)}</span>
                                                                                <span>Follow up: {formatDate(job.followUpDate)}</span>
                                                                            </div>
                                                                            {job.expectedSalary && (
                                                                                <p className="muted">Expected: {job.expectedSalary} {job.salaryCurrency}</p>
                                                                            )}
                                                                            <div className="task-actions">
                                                                                <button type="button" className="button secondary" onClick={() => startEdit(job)}>
                                                                                    Edit
                                                                                </button>
                                                                                <button type="button" className="button danger" onClick={() => handleDelete(job._id)}>
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
                        <h2>Add job</h2>
                        <div className="form-grid">
                            <input className="input" placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)} required />
                            <input className="input" placeholder="Role / Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                            <div className="row">
                                <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
                                    {STATUS_ORDER.map((value) => (
                                        <option key={value} value={value}>{value}</option>
                                    ))}
                                </select>
                                <select className="select" value={jobType} onChange={(e) => setJobType(e.target.value)}>
                                    <option value="full-time">Full-time</option>
                                    <option value="part-time">Part-time</option>
                                    <option value="contract">Contract</option>
                                    <option value="internship">Internship</option>
                                    <option value="freelance">Freelance</option>
                                </select>
                                <select className="select" value={priority} onChange={(e) => setPriority(e.target.value)}>
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                            <input className="input" placeholder="Category (optional)" value={category} onChange={(e) => setCategory(e.target.value)} />
                            <input className="input" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
                            <input className="input" placeholder="Job link" value={link} onChange={(e) => setLink(e.target.value)} />
                            <div className="row">
                                <input
                                    className="input"
                                    placeholder="Expected salary"
                                    value={expectedSalary}
                                    onChange={(e) => setExpectedSalary(e.target.value)}
                                />
                                <input
                                    className="input"
                                    placeholder="Currency"
                                    value={salaryCurrency}
                                    onChange={(e) => setSalaryCurrency(e.target.value)}
                                />
                                <button type="button" className="button secondary" onClick={estimateSalary}>
                                    AI salary
                                </button>
                            </div>
                            <textarea className="textarea" rows={3} placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
                            <div className="row">
                                <label className="muted">Applied</label>
                                <input className="input" type="date" value={appliedDate} onChange={(e) => setAppliedDate(e.target.value)} />
                                <label className="muted">Interview</label>
                                <input className="input" type="date" value={nextInterviewDate} onChange={(e) => setNextInterviewDate(e.target.value)} />
                            </div>
                            <div className="row">
                                <label className="muted">Follow up</label>
                                <input className="input" type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} />
                            </div>
                            <div className="card">
                                <h3>Reminders</h3>
                                <div className="row">
                                    <input className="input" type="date" value={reminderDate} onChange={(e) => setReminderDate(e.target.value)} />
                                    <input className="input" placeholder="Reminder note" value={reminderNote} onChange={(e) => setReminderNote(e.target.value)} />
                                    <button type="button" className="button secondary" onClick={addReminder}>
                                        Add
                                    </button>
                                </div>
                                {reminders.length > 0 && (
                                    <ul className="task-list">
                                        {reminders.map((item, index) => (
                                            <li key={`${item.date}-${index}`} className="muted">
                                                {item.date} {item.note ? `- ${item.note}` : ""}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <button type="submit" className="button">Save job</button>
                        </div>
                    </form>

                    <div className="card sticky">
                        <h2>Filters</h2>
                        <div className="filter-row">
                            <select className="select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                <option value="all">All status</option>
                                {STATUS_ORDER.map((value) => (
                                    <option key={value} value={value}>{value}</option>
                                ))}
                            </select>
                            <select className="select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                                <option value="all">All types</option>
                                <option value="full-time">Full-time</option>
                                <option value="part-time">Part-time</option>
                                <option value="contract">Contract</option>
                                <option value="internship">Internship</option>
                                <option value="freelance">Freelance</option>
                            </select>
                            <select className="select" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                                <option value="all">All priorities</option>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                            <input className="input" placeholder="Search jobs" value={search} onChange={(e) => setSearch(e.target.value)} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Jobs;
