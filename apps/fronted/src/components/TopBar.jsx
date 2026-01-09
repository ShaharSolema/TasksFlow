import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const TopBar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const initials = user?.username
        ? user.username.trim().slice(0, 2).toUpperCase()
        : "U";

    const handleLogout = async () => {
        await logout();
        setOpen(false);
        navigate("/login");
    };

    return (
        <header className="site-header">
            <div className="site-inner">
                <Link to="/" className="brand-link">
                    TaskFlow
                </Link>
                <nav className="nav-links">
                    <Link to="/tasks">Task Management</Link>
                    <Link to="/jobs">Job Management</Link>
                    <Link to="/jobs/calendar">Job Calendar</Link>
                    {user?.role === "admin" && <Link to="/charts">Charts</Link>}
                </nav>
                {!user ? (
                    <Link to="/login" className="button icon-button">
                        <svg viewBox="0 0 24 24" aria-hidden="true" className="icon">
                            <circle cx="12" cy="8" r="4"></circle>
                            <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8"></path>
                        </svg>
                        Login
                    </Link>
                ) : (
                    <div className="user-menu">
                        <button
                            type="button"
                            className="avatar-button"
                            onClick={() => setOpen((prev) => !prev)}
                        >
                            <span className="avatar">{initials}</span>
                        </button>
                        {open && (
                            <div className="menu-panel">
                                <Link to="/profile" onClick={() => setOpen(false)}>
                                    Update Profile
                                </Link>
                                {user.role === "admin" && (
                                    <Link to="/admin" onClick={() => setOpen(false)}>
                                        Admin Site
                                    </Link>
                                )}
                                <button type="button" onClick={handleLogout}>
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
};

export default TopBar;
