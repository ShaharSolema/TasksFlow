import jwt from 'jsonwebtoken';

const authRequired = (req, res, next) => {
    // Accept token from cookie or Authorization header (useful for tests).
    const authHeader = req.headers.authorization || '';
    const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const token = req.cookies?.token || bearerToken;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized.' });
    }
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        return res.status(500).json({ message: 'Server misconfigured.' });
    }
    try {
        const payload = jwt.verify(token, jwtSecret);
        const userId = payload.sub || payload.id || payload._id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized.' });
        }
        req.user = { _id: userId, role: payload.role };
        return next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized.' });
    }
};

export default authRequired;
