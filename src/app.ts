import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import auth from './routes/user.auth';
import cookieParser from 'cookie-parser';
import { setupSwagger } from './swagger/swagger';

dotenv.config();

const app = express();

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Correct CORS
const allowedOrigins = [
  "http://localhost:1234",
  "http://localhost:5000",
];

const corsOptions = {
  origin: function (origin: string | undefined, callback: Function) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, origin); // ✅ RETURN ORIGIN STRING
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

app.use(cors(corsOptions)); // ✅ THIS IS ENOUGH

// Cookies
app.use(cookieParser());

// Swagger AFTER CORS
setupSwagger(app);

// Routes
app.use('/api/auth', auth);

export default app;
