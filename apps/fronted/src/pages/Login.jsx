import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);
        try {
            await login(email, password);
            navigate("/tasks");
        } catch (err) {
            setError(err.message || "Login failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <form onSubmit={handleSubmit} className="card auth-card">
                <h2>Welcome back</h2>
                <label>
                    Email
                    <input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                        className="input"
                    />
                </label>
                <label>
                    Password
                    <input
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                        className="input"
                    />
                </label>
                {error && <p className="error">{error}</p>}
                <button type="submit" className="button" disabled={loading}>
                    {loading ? "Signing in..." : "Login"}
                </button>
            </form>
            <p className="footer-note">
                No account? <Link to="/register">Register</Link>
            </p>
        </div>
    );
};

export default Login;
