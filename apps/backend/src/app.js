import express from 'express';
import authRouter from '../routes/auth.route.js';
const app = express();// Initialize Express app
app.use(express.json());
app.use('/api/auth', authRouter);
app.get('/', (req, res) => {
    res.json({ status: 'ok' });
});

export default app;
