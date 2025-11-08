import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import auth from './routes/user.auth'
import cookieParser from 'cookie-parser'
dotenv.config();

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser())

app.use('/api/auth', auth);
export default app;
