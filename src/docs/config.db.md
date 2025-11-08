\*\*

- ============================================================
- 📘 MONGODB CONNECTION DOCUMENTATION
- ============================================================
-
- 📁 File: src/config/db/index.ts
- 🧠 Purpose: Establishes and manages the connection to MongoDB
-             using Mongoose. Provides robust error handling
-             and connection event logging.
-
- ============================================================
- 🔍 OVERVIEW
- ***
- This module handles the MongoDB connection for the application.
- It ensures:
- - The application connects to the database before server startup.
- - Connection errors are logged and handled gracefully.
- - Disconnection and runtime errors are monitored.
-
- ============================================================
- ⚙️ ENVIRONMENT VARIABLES
- ***
- - MONGO_URI : MongoDB connection string (required)
-               Example: mongodb://localhost:27017/hospitalDB
-
- ============================================================
- 🧩 FUNCTIONALITY
- ***
- 1.  Imports `mongoose` for MongoDB interactions and `dotenv` to load env variables.
- 2.  Reads `MONGO_URI` from environment variables.
- 3.  Defines an async function `connectDB()`:
-      - Checks if `MONGO_URI` is defined; exits process if missing.
-      - Connects to MongoDB using `mongoose.connect(MONGO_URI)`.
-      - Logs success message on successful connection.
- 4.  Listens to MongoDB connection events:
-      - `disconnected`: Logs a warning when MongoDB disconnects.
-      - `error`: Logs any runtime connection errors.
-
- ============================================================
- 🔐 ERROR HANDLING
- ***
- - Exits the Node.js process with `process.exit(1)` if:
-      - `MONGO_URI` is not defined
-      - Connection fails
- - Monitors connection errors and disconnections during runtime.
-
- ============================================================
- 🧩 EXAMPLE USAGE
- ***
- import { connectDB } from './config/db';
-
- (async () => {
- try {
-     await connectDB();
-     app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
- } catch (error) {
-     console.error('Database connection failed:', error);
- }
- })();
-
- ============================================================
- 👨‍💻 AUTHOR / MAINTAINER
- ***
- Developed by : Prathap Kunarapu
- Role : Backend Developer (Node.js / MongoDB / TypeScript)
- Version : 1.0.0
- Last Updated : 23 Oct 2025
- ============================================================
  \*/

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI: string = process.env.MONGO_URI || '';

export const connectDB = async (): Promise<void> => {
try {
if (!MONGO_URI) {
console.log('MONGO_URI is not defined in environment variables');
process.exit(1);
}
await mongoose.connect(MONGO_URI);
console.log('MongoDB connected successfully');
} catch (error) {
console.error('Error connecting to MongoDB:', error);
process.exit(1);
}

// Connection event listeners
mongoose.connection.on('disconnected', () => {
console.warn('⚠️ MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
console.error('MongoDB connection error:', err);
});
};
