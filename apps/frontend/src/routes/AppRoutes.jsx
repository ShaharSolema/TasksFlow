import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";
import UpdateProfile from "../pages/UpdateProfile.jsx";
import Tasks from "../pages/Tasks.jsx";
import ProtectedRoute from "../components/ProtectedRoute.jsx";
import DashboardLayout from "../components/DashboardLayout.jsx";
import AuthLayout from "../components/AuthLayout.jsx";
import Home from "../pages/Home.jsx";
import Charts from "../pages/Charts.jsx";
import Admin from "../pages/Admin.jsx";
import Jobs from "../pages/Jobs.jsx";
import JobCalendar from "../pages/JobCalendar.jsx";

function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                {/* Public auth pages */}
                <Route
                    path="/login"
                    element={
                        <AuthLayout>
                            <Login />
                        </AuthLayout>
                    }
                />
                <Route
                    path="/register"
                    element={
                        <AuthLayout>
                            <Register />
                        </AuthLayout>
                    }
                />
                {/* Protected dashboard pages */}
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <DashboardLayout>
                                <UpdateProfile />
                            </DashboardLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/tasks"
                    element={
                        <ProtectedRoute>
                            <DashboardLayout>
                                <Tasks />
                            </DashboardLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/jobs"
                    element={
                        <ProtectedRoute>
                            <DashboardLayout>
                                <Jobs />
                            </DashboardLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/jobs/calendar"
                    element={
                        <ProtectedRoute>
                            <DashboardLayout>
                                <JobCalendar />
                            </DashboardLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/charts"
                    element={
                        <ProtectedRoute>
                            <DashboardLayout>
                                <Charts />
                            </DashboardLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute>
                            <DashboardLayout>
                                <Admin />
                            </DashboardLayout>
                        </ProtectedRoute>
                    }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;
