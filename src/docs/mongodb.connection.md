\*\*

- ============================================================
- 📘 MONGODB CONNECTION DOCUMENTATION
- ============================================================
-
- 📁 File: src/index.ts
- 🧠 Purpose: Establishes a connection to the MongoDB database
-             using Mongoose. Provides a reusable async function
-             to connect to the database in the application.
-
- ============================================================
- 🔍 OVERVIEW
- ***
- This module handles the MongoDB connection logic. It ensures:
- - The application connects to the database before starting.
- - Connection errors are caught and logged.
- - Reusable for any service or module that requires database access.
-
- ============================================================
- ⚙️ ENVIRONMENT VARIABLES
- ***
- - MONGO_URI : MongoDB connection string (required)
-
- ============================================================
- 🧩 FUNCTIONALITY
- ***
- 1.  Imports `mongoose` for MongoDB interactions.
- 2.  Defines an async function `connectDB()`:
-      - Uses `mongoose.connect()` with the URI from env variables.
-      - Prints "MongoDB connected" on success.
-      - Throws an error if connection fails.
- 3.  This function is imported and called in `server.ts` before
- starting the Express server to ensure database availability.
-
- ============================================================
- 🔐 ERROR HANDLING
- ***
- - Connection failures are caught and logged with descriptive messages.
- - Prevents the server from running without a database connection.
-
- ============================================================
- 🧩 EXAMPLE USAGE
- ***
- import { connectDB } from './config/db';
-
- (async () => {
- try {
-     await connectDB();
-     app.listen(PORT, () => console.log(`Server running on ${PORT}`));
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

export const connectDB = async (): Promise<void> => {
try {
if (!process.env.MONGO_URI) {
throw new Error('MONGO_URI is not defined in environment variables');
}
await mongoose.connect(process.env.MONGO_URI, {
autoIndex: true, // optional: build indexes automatically
});
console.log('MongoDB connected');
} catch (error) {
console.error('MongoDB connection error:', error);
throw error;
}
};
