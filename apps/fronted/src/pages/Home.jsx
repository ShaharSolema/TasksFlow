import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const Home = () => {
    const { user } = useAuth();

    return (
        <>
            <div className="background" />
            <div className="orb orb-1" />
            <div className="orb orb-2" />
            <div className="orb orb-3" />
            <div className="landing">
                <header className="landing-header">
                    <div className="logo">TF</div>
                    <nav className="landing-nav">
                        {!user && (
                            <>
                                <Link to="/login">Login</Link>
                                <Link to="/register" className="button">
                                    Register
                                </Link>
                            </>
                        )}
                        {user && (
                            <Link to="/tasks" className="button">
                                Go to dashboard
                            </Link>
                        )}
                    </nav>
                </header>
                <div className="landing-hero glass-panel">
                    <div>
                        <h1>TaskFlow keeps your tasks and job search in sync.</h1>
                        <p>
                            Plan your day, track applications, and surface insights with a clean
                            glass dashboard that feels calm but powerful.
                        </p>
                        <div className="landing-actions">
                            {user ? (
                                <Link to="/tasks" className="button">
                                    Go to dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link to="/register" className="button">
                                        Get started
                                    </Link>
                                    <Link to="/login" className="button secondary">
                                        Sign in
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="landing-kpis">
                        <div>
                            <span className="landing-kpi">Tasks</span>
                            <strong>Track focus and deadlines</strong>
                        </div>
                        <div>
                            <span className="landing-kpi">Jobs</span>
                            <strong>Follow interviews and offers</strong>
                        </div>
                        <div>
                            <span className="landing-kpi">Insights</span>
                            <strong>See trends and top activity</strong>
                        </div>
                    </div>
                </div>
                <div className="landing-grid">
                    <div className="landing-card glass-panel">
                        <h3>Kanban that adapts</h3>
                        <p>Design your own columns, labels, and categories per workspace.</p>
                    </div>
                    <div className="landing-card glass-panel">
                        <h3>Job tracker built in</h3>
                        <p>Save companies, follow-ups, and reminders in one focused flow.</p>
                    </div>
                    <div className="landing-card glass-panel">
                        <h3>Admin analytics</h3>
                        <p>Measure activity across tasks and jobs with clean dashboards.</p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Home;
