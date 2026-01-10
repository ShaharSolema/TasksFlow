const AuthLayout = ({ children }) => (
    <>
        <div className="background" />
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="auth-shell">{children}</div>
    </>
);

export default AuthLayout;
