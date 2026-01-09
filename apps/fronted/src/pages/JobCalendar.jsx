import { useEffect, useMemo, useState } from "react";
import { API_BASE } from "../lib/api.js";

const buildMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startWeekday = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    const cells = [];

    for (let i = 0; i < startWeekday; i += 1) {
        cells.push(null);
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
        cells.push(new Date(year, month, day));
    }
    return { year, month, cells };
};

const formatKey = (date) => date.toISOString().slice(0, 10);

const JobCalendar = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [currentDate, setCurrentDate] = useState(new Date());

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

    const events = useMemo(() => {
        const items = [];
        for (const job of jobs) {
            if (job.appliedDate) {
                items.push({
                    date: job.appliedDate,
                    title: `${job.company} - Applied`,
                    type: "applied"
                });
            }
            if (job.nextInterviewDate) {
                items.push({
                    date: job.nextInterviewDate,
                    title: `${job.company} - Interview`,
                    type: "interview"
                });
            }
            if (job.followUpDate) {
                items.push({
                    date: job.followUpDate,
                    title: `${job.company} - Follow up`,
                    type: "follow-up"
                });
            }
            if (Array.isArray(job.reminders)) {
                for (const reminder of job.reminders) {
                    if (reminder?.date) {
                        items.push({
                            date: reminder.date,
                            title: `${job.company} - Reminder`,
                            type: "reminder",
                            note: reminder.note
                        });
                    }
                }
            }
        }
        return items;
    }, [jobs]);

    const groupedEvents = useMemo(() => {
        const map = {};
        for (const item of events) {
            const key = formatKey(new Date(item.date));
            if (!map[key]) map[key] = [];
            map[key].push(item);
        }
        return map;
    }, [events]);

    const { year, month, cells } = buildMonth(currentDate);
    const monthLabel = new Date(year, month).toLocaleDateString(undefined, {
        month: "long",
        year: "numeric"
    });

    const goPrev = () => setCurrentDate(new Date(year, month - 1, 1));
    const goNext = () => setCurrentDate(new Date(year, month + 1, 1));

    return (
        <div className="page">
            <div className="hero">
                <div>
                    <h1>Job Calendar</h1>
                    <p className="muted">Interviews, follow-ups, and reminders.</p>
                </div>
                <div className="row">
                    <button type="button" className="button secondary" onClick={goPrev}>Prev</button>
                    <span className="badge">{monthLabel}</span>
                    <button type="button" className="button secondary" onClick={goNext}>Next</button>
                </div>
            </div>

            {error && <p className="error">{error}</p>}
            {loading ? (
                <p className="muted">Loading...</p>
            ) : (
                <div className="calendar-grid">
                    <div className="calendar-card">
                        <div className="calendar-week">
                            {"Sun Mon Tue Wed Thu Fri Sat".split(" ").map((day) => (
                                <span key={day} className="calendar-day-label">{day}</span>
                            ))}
                        </div>
                        <div className="calendar-body">
                            {cells.map((cell, index) => {
                                if (!cell) {
                                    return <div key={`empty-${index}`} className="calendar-cell empty" />;
                                }
                                const key = formatKey(cell);
                                const dayEvents = groupedEvents[key] || [];
                                return (
                                    <div key={key} className="calendar-cell">
                                        <span className="calendar-date">{cell.getDate()}</span>
                                        {dayEvents.slice(0, 3).map((item, idx) => (
                                            <span key={`${key}-${idx}`} className={`event-tag ${item.type}`}>
                                                {item.title}
                                            </span>
                                        ))}
                                        {dayEvents.length > 3 && (
                                            <span className="event-more">+{dayEvents.length - 3} more</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="calendar-card">
                        <h2>Upcoming</h2>
                        <div className="calendar-list">
                            {Object.keys(groupedEvents)
                                .sort()
                                .map((dateKey) => (
                                    <div key={dateKey} className="calendar-group">
                                        <h3>{new Date(dateKey).toLocaleDateString()}</h3>
                                        <ul className="task-list">
                                            {groupedEvents[dateKey].map((item, idx) => (
                                                <li key={`${dateKey}-${idx}`} className="muted">
                                                    {item.title}{item.note ? ` - ${item.note}` : ""}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            {events.length === 0 && <p className="muted">No events yet.</p>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobCalendar;
