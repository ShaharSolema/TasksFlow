import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button, Paper, PasswordInput, Stack, Text, TextInput, Title } from "@mantine/core";
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
            <Paper className="auth-card" radius="lg" shadow="md" p="lg">
                <form onSubmit={handleSubmit}>
                    <Stack>
                        <Title order={2}>Welcome back</Title>
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
                            {loading ? "Signing in..." : "Login"}
                        </Button>
                    </Stack>
                </form>
            </Paper>
            <Text className="footer-note">
                No account? <Link to="/register">Register</Link>
            </Text>
        </div>
    );
};

export default Login;
