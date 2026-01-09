import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";
import UpdateProfile from "../pages/UpdateProfile.jsx";
import Tasks from "../pages/Tasks.jsx";
import ProtectedRoute from "../components/ProtectedRoute.jsx";

const AppRoutes = () => (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Navigate to="/tasks" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <UpdateProfile />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/tasks"
                element={
                    <ProtectedRoute>
                        <Tasks />
                    </ProtectedRoute>
                }
            />
            <Route path="*" element={<Navigate to="/tasks" replace />} />
        </Routes>
    </BrowserRouter>
);

export default AppRoutes;
