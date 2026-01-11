import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const TopBar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);

    // Quick initials for the avatar button.
    const initials = user?.username
        ? user.username.trim().slice(0, 2).toUpperCase()
        : "U";

    // Logout then redirect to login.
    const handleLogout = async () => {
        await logout();
        setOpen(false);
        navigate("/login");
    };

    useEffect(() => {
        // Close the menu when clicking outside or scrolling.
        const handleClick = (event) => {
            if (!menuRef.current) return;
            if (!menuRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        const handleScroll = () => setOpen(false);
        if (open) {
            document.addEventListener("mousedown", handleClick);
            window.addEventListener("scroll", handleScroll, { passive: true });
        }
        return () => {
            document.removeEventListener("mousedown", handleClick);
            window.removeEventListener("scroll", handleScroll);
        };
    }, [open]);

    const pageTitles = {
        "/tasks": "Tasks",
        "/jobs": "Jobs",
        "/jobs/calendar": "Job Calendar",
        "/charts": "Charts",
        "/admin": "Admin",
        "/profile": "Profile"
    };
    const pageTitle = pageTitles[location.pathname] || "Workspace";

    return (
        <header className="navbar">
            <div>
                <div className="page-title">{pageTitle}</div>
                <div className="page-subtitle">Manage your work in one place</div>
            </div>
            <div className="navbar-right">
                
                {!user ? (
                    <Link to="/login" className="nav-btn">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <circle cx="12" cy="8" r="4"></circle>
                            <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8"></path>
                        </svg>
                    </Link>
                ) : (
                    <div className="user-menu" ref={menuRef}>
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
