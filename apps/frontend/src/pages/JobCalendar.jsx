import { useEffect, useMemo, useState } from "react";
import { Badge, Button, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { API_BASE } from "../lib/api.js";

// Build the month grid for the calendar.
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

    // Small fetch helper for this page.
    const fetchJson = async (path) => {
        const response = await fetch(`${API_BASE}${path}`, { credentials: "include" });
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
            <Group justify="space-between" mb="md">
                <div>
                    <Title order={2}>Job Calendar</Title>
                    <Text c="dimmed">Interviews, follow-ups, and reminders.</Text>
                </div>
                <Group>
                    <Button variant="light" onClick={goPrev}>Prev</Button>
                    <Badge size="lg" radius="xl">{monthLabel}</Badge>
                    <Button variant="light" onClick={goNext}>Next</Button>
                </Group>
            </Group>

            {error && <Text c="red">{error}</Text>}
            {loading ? (
                <Text c="dimmed">Loading...</Text>
            ) : (
                <div className="calendar-grid">
                    <Paper className="calendar-card" radius="lg" shadow="sm">
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
                    </Paper>
                    <Paper className="calendar-card" radius="lg" shadow="sm">
                        <Title order={4}>Upcoming</Title>
                        <div className="calendar-list">
                            {Object.keys(groupedEvents)
                                .sort()
                                .map((dateKey) => (
                                    <div key={dateKey} className="calendar-group">
                                        <Text fw={600}>{new Date(dateKey).toLocaleDateString()}</Text>
                                        <Stack gap={4} mt="xs">
                                            {groupedEvents[dateKey].map((item, idx) => (
                                                <Text key={`${dateKey}-${idx}`} size="sm" c="dimmed">
                                                    {item.title}{item.note ? ` - ${item.note}` : ""}
                                                </Text>
                                            ))}
                                        </Stack>
                                    </div>
                                ))}
                            {events.length === 0 && <Text c="dimmed">No events yet.</Text>}
                        </div>
                    </Paper>
                </div>
            )}
        </div>
    );
};

export default JobCalendar;
