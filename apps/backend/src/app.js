import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRouter from '../routes/user.route.js';
import taskRouter from '../routes/task.route.js';
import adminRouter from '../routes/admin.route.js';
import jobRouter from '../routes/job.route.js';
const app = express();// Initialize Express app
app.use(express.json());
app.use(cookieParser());
// Allow browser requests with cookies from the frontend.
app.use(cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true
}));
//routes
app.use('/api/auth', authRouter);
app.use('/api/tasks', taskRouter);
app.use('/api/jobs', jobRouter);
app.use('/api/admin', adminRouter);
app.get('/', (req, res) => {
    res.json({ status: 'ok' });
});

export default app;
