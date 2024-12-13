import express from 'express';
import connectDB from './config/config.js'
import dotenv from 'dotenv';

import hrRoutes from './routes/hr.route.js';  // Import routes

dotenv.config(); 
const app = express();

connectDB()
app.use(express.json())




app.use('/api/v4/hr', hrRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
