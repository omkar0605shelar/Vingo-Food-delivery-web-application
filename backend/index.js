import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import connectDb from './config/db.js';
import authRouter from './routes/authRoutes.js';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin:"http://localhost:5173",
  credentials:true
}));

app.use('/api/auth', authRouter);


const startServer = async () => {
  try {
    await connectDb(); 
    app.listen(PORT, () => {
      console.log(`🚀 Server started on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
  }
};

startServer();