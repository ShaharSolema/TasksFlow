import Sidebar from "./Sidebar.jsx";
import TopBar from "./TopBar.jsx";

// Shared layout for authenticated pages.
const DashboardLayout = ({ children }) => (
    <>
        <div className="background" />
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="dashboard">
            <Sidebar />
            <main className="main-content">
                <TopBar />
                {children}
            </main>
        </div>
    </>
);

export default DashboardLayout;
