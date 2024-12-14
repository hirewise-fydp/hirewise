import express from 'express';
import connectDB from './config/config.js';
import cors from 'cors'
import cookieParser from 'cookie-parser'; //apne server se user ke browser ki cookies access kar paon or unpe crud lagasakoon
import hrRoutes from './routes/hr.route.js';  // Import routes
import userRoutes from "./routes/user.route.js"
import dotenv from 'dotenv';
dotenv.config(); 



const app = express();
// app.use(cors({origin: process.env.CORS_ORIGIN, credentials: 'include'}))
// app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(cors())

app.use(express.json({limit: "1024kb"}))
app.use(express.urlencoded({extended: true, limit: "16Kkb"}))
app.use(express.static("public"))
app.use(cookieParser())


connectDB()
app.use(express.json())
// app.use("/", userRoutes);
app.use("/api/user", userRoutes);

// Middleware to parse JSON

// Define routes
app.use('/api/v4/hr', hrRoutes);
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  const statusCode = err.statusCode || 500;
  const message = err.message || "An unexpected error occurred";
  res.status(statusCode).json({ message });
});


// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  

});
