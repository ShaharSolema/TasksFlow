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
        <div>
            <h1>Update Profile</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Username
                    <input
                        type="text"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                    />
                </label>
                <label>
                    Email
                    <input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                    />
                </label>
                {message && <p>{message}</p>}
                {error && <p>{error}</p>}
                <button type="submit" disabled={loading}>
                    {loading ? "Saving..." : "Save"}
                </button>
            </form>
        </div>
    );
};

export default UpdateProfile;
