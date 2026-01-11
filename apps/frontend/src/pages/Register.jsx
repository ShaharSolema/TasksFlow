import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Paper, PasswordInput, Stack, Text, TextInput, Title } from "@mantine/core";
import { useAuth } from "../context/AuthContext.jsx";

const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Submit registration form.
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
            <Paper className="auth-card" radius="lg" shadow="md" p="lg">
                <form onSubmit={handleSubmit}>
                    <Stack>
                        <Title order={2}>Create your account</Title>
                        <TextInput
                            label="Username"
                            value={username}
                            onChange={(event) => setUsername(event.target.value)}
                            required
                        />
                        <TextInput
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                        />
                        <PasswordInput
                            label="Password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                        />
                        {error && <Text c="red">{error}</Text>}
                        <Button type="submit" loading={loading}>
                            {loading ? "Creating..." : "Register"}
                        </Button>
                    </Stack>
                </form>
            </Paper>
            <Text className="footer-note">
                Already registered? <Link to="/login">Login</Link>
            </Text>
        </div>
    );
};

export default Register;
