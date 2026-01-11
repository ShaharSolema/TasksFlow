import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const Sidebar = () => {
    const { user } = useAuth();
    const location = useLocation();

    // Highlight the active route.
    const isActive = (path) => location.pathname === path;

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="logo">TF</div>
                <div className="logo-text">TaskFlow</div>
            </div>
            <nav className="nav-menu">
                <div className="nav-section">
                    <div className="nav-section-title">Workspace</div>
                    <ul>
                        <li className="nav-item">
                            <Link className={`nav-link ${isActive("/tasks") ? "active" : ""}`} to="/tasks">
                                <span className="nav-icon">◎</span>
                                Tasks
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className={`nav-link ${isActive("/jobs") ? "active" : ""}`} to="/jobs">
                                <span className="nav-icon">◆</span>
                                Jobs
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link
                                className={`nav-link ${isActive("/jobs/calendar") ? "active" : ""}`}
                                to="/jobs/calendar"
                            >
                                <span className="nav-icon">◷</span>
                                Calendar
                            </Link>
                        </li>
                    </ul>
                </div>
                <div className="nav-section">
                    <div className="nav-section-title">Analytics</div>
                    <ul>
                        {user?.role === "admin" && (
                            <li className="nav-item">
                                <Link className={`nav-link ${isActive("/charts") ? "active" : ""}`} to="/charts">
                                    <span className="nav-icon">▤</span>
                                    Charts
                                </Link>
                            </li>
                        )}
                        {user?.role === "admin" && (
                            <li className="nav-item">
                                <Link className={`nav-link ${isActive("/admin") ? "active" : ""}`} to="/admin">
                                    <span className="nav-icon">▣</span>
                                    Admin
                                </Link>
                            </li>
                        )}
                        <li className="nav-item">
                            <Link className={`nav-link ${isActive("/profile") ? "active" : ""}`} to="/profile">
                                <span className="nav-icon">◉</span>
                                Profile
                            </Link>
                        </li>
                    </ul>
                </div>
            </nav>
            <div className="sidebar-footer">
                <div className="user-profile">
                    <div className="user-avatar">
                        {user?.username?.trim().slice(0, 2).toUpperCase() || "U"}
                    </div>
                    <div className="user-info">
                        <div className="user-name">{user?.username || "User"}</div>
                        <div className="user-role">{user?.role || "member"}</div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
