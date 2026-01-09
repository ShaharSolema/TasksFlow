import { useAuth } from "../context/AuthContext.jsx";

const Admin = () => {
    const { user } = useAuth();

    if (!user || user.role !== "admin") {
        return (
            <div className="page">
                <h1>Admin</h1>
                <p className="error">You do not have access to this page.</p>
            </div>
        );
    }

    return (
        <div className="page">
            <h1>Admin Dashboard</h1>
            <p className="muted">Admin analytics and controls will appear here.</p>
        </div>
    );
};

export default Admin;
