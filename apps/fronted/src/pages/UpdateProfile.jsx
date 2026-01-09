import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

const UpdateProfile = () => {
    const { user, updateProfile } = useAuth();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setUsername(user.username || "");
            setEmail(user.email || "");
        }
    }, [user]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage("");
        setError("");
        setLoading(true);
        try {
            await updateProfile(username, email);
            setMessage("Profile updated.");
        } catch (err) {
            setError(err.message || "Update failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <form onSubmit={handleSubmit} className="card auth-card">
                <h2>Update Profile</h2>
                <label>
                    Username
                    <input
                        type="text"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        className="input"
                    />
                </label>
                <label>
                    Email
                    <input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="input"
                    />
                </label>
                {message && <p className="muted">{message}</p>}
                {error && <p className="error">{error}</p>}
                <button type="submit" className="button" disabled={loading}>
                    {loading ? "Saving..." : "Save"}
                </button>
            </form>
        </div>
    );
};

export default UpdateProfile;
