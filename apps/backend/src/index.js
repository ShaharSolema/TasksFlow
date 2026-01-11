import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from '../config/database.js';
import app from './app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
    path: path.resolve(__dirname, '../.env')
});

// Boot the server after DB connects.
async function startServer() {
    try {
        await connectDB();

        app.on("error", (err) => {
            console.log("Server error:", err);
            throw err;
        });

        const port = process.env.PORT || 8000;
        app.listen(port, () => {
            console.log(`\n Server is running on port ${port}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

startServer();
