import express from 'express';
import connectDB from './config/config.js';
import dotenv from 'dotenv';
import cors from 'cors'; // Import cors

import hrRoutes from './routes/hr.route.js'; // Import routes

dotenv.config();
const app = express();

// Connect to the database
connectDB();

// Use CORS middleware
app.use(cors());

// Middleware to parse JSON
app.use(express.json());

// Define routes
app.use('/api/v4/hr', hrRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
