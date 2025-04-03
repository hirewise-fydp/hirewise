import express from 'express';
import connectDB from './config/config.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import hrRoutes from './routes/hr.route.js';
import userRoutes from "./routes/user.route.js";
import candidateRoutes from "./routes/candidate.route.js";
import dotenv from 'dotenv';
import { verifyJWT } from './middlewares/auth.middleware.js';
import {worker} from './Queue/ocr/ocrWorker.js';
dotenv.config();

const app = express();
app.use(cors({
  origin: "http://localhost:5173", // Frontend origin
  credentials: true, // Allow credentials (cookies)
}));

app.use(express.json({ limit: "1024kb" }));
app.use(express.urlencoded({ extended: true, limit: "16Kb" }));
app.use(express.static("public"));
app.use(cookieParser());

connectDB();

app.use("/api/user", userRoutes);
app.use('/api/v4/hr', verifyJWT, hrRoutes);
app.use('/api/v4/candidate', candidateRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});