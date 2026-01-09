const adminRequired = (req, res, next) => {
    // Block non-admin users from admin-only routes.
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden.' });
    }
    return next();
};

export default adminRequired;
