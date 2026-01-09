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

const startServer = async () => {
    try{
        await connectDB();

        app.on("error", (err) => {
            console.log("Server error:", err);
            throw err;
        });

        app.listen(process.env.PORT||8000,()=>{
            console.log(`\n Server is running on port ${process.env.PORT}`);
        });
    }
    catch(error){
        console.error("Failed to start server:", error);
        process.exit(1);
    }   
};
startServer();
