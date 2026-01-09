import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);
        try {
            await register(username, email, password);
            navigate("/login");
        } catch (err) {
            setError(err.message || "Registration failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <form onSubmit={handleSubmit} className="card auth-card">
                <h2>Create your account</h2>
                <label>
                    Username
                    <input
                        type="text"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        required
                        className="input"
                    />
                </label>
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
                    {loading ? "Creating..." : "Register"}
                </button>
            </form>
            <p className="footer-note">
                Already registered? <Link to="/login">Login</Link>
            </p>
        </div>
    );
};

export default Register;
