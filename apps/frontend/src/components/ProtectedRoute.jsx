import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    const location = useLocation();
    const [showLoader, setShowLoader] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowLoader(false);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    // Show a simple loading state while we check the session.
    if (loading || showLoader) {
        return (
            <div className="loading-screen">
                <div className="loader" />
                <div className="loading-text">Loading your workspace...</div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    return children;
}

export default ProtectedRoute;
