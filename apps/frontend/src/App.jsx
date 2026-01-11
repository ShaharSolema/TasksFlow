import { MantineProvider } from "@mantine/core";
import { AuthProvider } from "./context/AuthContext.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";

function App() {
    return (
        <MantineProvider
            theme={{
                fontFamily: "Trebuchet MS, 'Lucida Sans Unicode', 'Lucida Grande', sans-serif",
                primaryColor: "blue",
                defaultRadius: "md"
            }}
        >
            {/* App-level providers */}
            <ErrorBoundary>
                <AuthProvider>
                    <AppRoutes />
                </AuthProvider>
            </ErrorBoundary>
        </MantineProvider>
    );
}

export default App;
