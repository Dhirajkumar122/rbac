import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db.js';
import { router } from './routes/router.js';
import {rbacschema} from './models/rbacmodel.js'

dotenv.config();

const app = express();

// Enable CORS
// app.use(cors());
app.use(cors({
    origin: 'http://localhost:3000',  // Allow requests only from your React frontend
    methods: ['GET', 'POST', 'PUT', 'PATCH','DELETE'], 
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed methods
    credentials: true  // Allow credentials (cookies, authorization headers, etc.)
}));

// Use express's built-in JSON parser
app.use(express.json());

// Set up routes
app.use('/api', router);

// Connect to the database
connectDB();
const syncModels = async () => {
    try {
        await rbacschema.sync(); 
        console.log('User model synced successfully.');
    } catch (error) {
        console.error('Error syncing models:', error);
    }
};
  syncModels();

// Start the server
app.listen(8080, () => {
    console.log("Server running on port 8080");
});
