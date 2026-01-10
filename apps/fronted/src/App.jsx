import { MantineProvider } from "@mantine/core";
import { AuthProvider } from "./context/AuthContext.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";

function App() {
    return (
        <MantineProvider
            theme={{
                fontFamily: "Trebuchet MS, 'Lucida Sans Unicode', 'Lucida Grande', sans-serif",
                primaryColor: "blue",
                defaultRadius: "md"
            }}
        >
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </MantineProvider>
    );
}

export default App;
