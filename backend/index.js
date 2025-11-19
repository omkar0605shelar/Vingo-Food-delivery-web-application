import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import connectDb from './config/db.js';
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import shopRouter from './routes/shopRoutes.js';
import itemRouter from './routes/itemRoutes.js';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin:"http://localhost:5174",
  credentials:true
}));

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/shop', shopRouter);
app.use('/api/item', itemRouter);

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