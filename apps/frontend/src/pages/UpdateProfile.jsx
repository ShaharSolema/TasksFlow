import { useEffect, useState } from "react";
import { Button, Paper, Stack, Text, TextInput, Title } from "@mantine/core";
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

    // Save profile updates.
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
            <Paper className="auth-card" radius="lg" shadow="md" p="lg">
                <form onSubmit={handleSubmit}>
                    <Stack>
                        <Title order={2}>Update Profile</Title>
                        <TextInput
                            label="Username"
                            value={username}
                            onChange={(event) => setUsername(event.target.value)}
                        />
                        <TextInput
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                        />
                        {message && <Text c="dimmed">{message}</Text>}
                        {error && <Text c="red">{error}</Text>}
                        <Button type="submit" loading={loading}>
                            {loading ? "Saving..." : "Save"}
                        </Button>
                    </Stack>
                </form>
            </Paper>
        </div>
    );
};

export default UpdateProfile;
