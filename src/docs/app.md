\*\*

- ============================================================
- 📘 EXPRESS APPLICATION DOCUMENTATION
- ============================================================
-
- 📁 File: src/app.ts
- 🧠 Purpose: Configures and initializes the Express.js application,
-             applies middleware, and sets up authentication routes.
-
- ============================================================
- 🔍 OVERVIEW
- ***
- This file initializes the Express application and sets up
- essential middleware for the backend API. It also mounts
- authentication routes for user login, registration, and related
- actions.
-
- ============================================================
- ⚙️ ENVIRONMENT VARIABLES
- ***
- - CORS_ORIGIN : Allowed origin for cross-origin requests
-                 (defined in the `.env` file)
-
- ============================================================
- 🧩 MIDDLEWARE CONFIGURATION
- ***
- 1.  `cors`:
-      - Enables Cross-Origin Resource Sharing.
-      - Configured with `origin` from environment variable and
-        `credentials: true` to allow cookies/auth headers.
- 2.  `express.json()`:
-      - Parses incoming JSON request bodies.
-
- ============================================================
- 🧩 ROUTES
- ***
- - `/api/auth` : Handles all authentication-related endpoints.
- - Imported from `./routes/user.auth`.
- - Example endpoints: login, register, logout, refresh token.
-
- ============================================================
- 🔐 SECURITY NOTES
- ***
- - Restrict `CORS_ORIGIN` to trusted domains only.
- - Sensitive routes should be protected with authentication middleware.
-
- ============================================================
- 🧩 EXAMPLE USAGE
- ***
- import app from './app';
-
- app.listen(PORT, () => {
- console.log(`Server running on port ${PORT}`);
- });
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

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/user.auth'));

export default app;
