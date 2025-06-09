import express from 'express';
import connectDB from './config/config.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import hrRoutes from './routes/hr.route.js';
import userRoutes from "./routes/user.route.js";
import candidateRoutes from "./routes/candidate.route.js";
import dotenv from 'dotenv';
import { verifyJWT } from './middlewares/auth.middleware.js';
import testRoutes from "./routes/test.route.js";
import { initializeCronJobs } from './schedulers/updateJobStatus.js';
import { cvWorker } from './Queue/cv/worker.js';
import { worker } from './Queue/jd/ocrWorker.js';
import { ApiError } from './utils/ApiError.js';
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
initializeCronJobs();
connectDB();

app.use("/api/user", userRoutes);
app.use('/api/v4/hr', verifyJWT, hrRoutes);
app.use('/api/v4/candidate', candidateRoutes);
app.use("/api/v4/test", testRoutes);


app.use((err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  }

  // For unknown errors
  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
    errors: [],
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});