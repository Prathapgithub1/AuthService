# User Routes Documentation

This document explains the **User API routes** for authentication, registration, token refresh, and profile management using **Node.js, Express, MongoDB, Redis, and JWT**. This guide is beginner-friendly and includes explanations of the code.

---

## Table of Contents

1. [Overview](#overview)
2. [Dependencies & Imports](#dependencies--imports)
3. [Routes](#routes)

   - [User Registration (`/userRegister`)](#user-registration-userregister)
   - [User Login (`/userLogin`)](#user-login-userlogin)
   - [Refresh Token (`/refreshToken`)](#refresh-token-refreshtoken)
   - [Show Profile (`/showProfile`)](#show-profile-showprofile)

4. [JWT & Refresh Token Flow](#jwt--refresh-token-flow)
5. [Redis Token Storage](#redis-token-storage)
6. [Error Handling](#error-handling)
7. [Security Considerations](#security-considerations)
8. [Conclusion](#conclusion)

---

## Overview

This API provides the following functionalities for user management:

- User Registration
- User Login with JWT token issuance
- Refresh JWT token using refresh token stored in Redis and HttpOnly cookie
- Show user profile with authentication

Technologies used:

- **Express.js** – Web framework
- **MongoDB + Mongoose** – Database
- **Redis** – In-memory store for refresh tokens
- **JWT (JSON Web Tokens)** – Authentication
- **Cookies** – Store refresh token securely

---

## Dependencies & Imports

```ts
import { Router, Request, Response } from 'express';
import { handleCrudOperation } from '../utils/handleCrudOperation';
import { validateUser } from '../utils/userValidation';
import { comparePassword, hashPassword } from '../utils/passwordUtils';
import { generateJwtToken, verifyJwtToken, generateRefereshedToken, verifyRefreshedToken } from '../middlewares/jwt';
import mongoose from 'mongoose';
import redisClient from '../config/redis';
import jwt from 'jsonwebtoken';
```

**Explanation:**

- `Router` – Express router to define routes.
- `handleCrudOperation` – Generic function to handle MongoDB CRUD operations.
- `validateUser` – Middleware to validate user input.
- `comparePassword` / `hashPassword` – Utilities to hash and validate passwords.
- `generateJwtToken` / `verifyJwtToken` / `generateRefereshedToken` / `verifyRefreshedToken` – JWT utility functions for authentication.
- `redisClient` – Redis instance for storing refresh tokens.
- `mongoose` – MongoDB ObjectId handling.
- `jsonwebtoken` – Used to decode or verify JWT tokens.

---

## Routes

### User Registration (`/userRegister`)

```ts
router.post('/userRegister', async (req: Request, res: Response) => { ... });
```

**Purpose:** Register a new user.

**Flow:**

1. Validate that `req.body.params` is not empty.
2. Use `validateUser` to check required fields like `name`, `email`, `password`.
3. Check if the user already exists in MongoDB.
4. Hash the password using `hashPassword`.
5. Insert the new user in MongoDB using `handleCrudOperation('User', 'insertOne', {...})`.
6. Return `201 Created` with the user details or appropriate error messages.

**Example Request:**

```json
{
  "params": {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "user",
    "phoneNumber": "1234567890",
    "address": "123 Street, City"
  }
}
```

---

### User Login (`/userLogin`)

```ts
router.post("/userLogin", async (req: Request, res: Response) => { ... });
```

**Purpose:** Login a user and generate **JWT access token** and **refresh token**.

**Flow:**

1. Validate `req.body.params`.
2. Fetch user by email from MongoDB.
3. Compare the provided password with the stored hashed password using `comparePassword`.
4. If valid, generate:

   - **JWT Access Token** → Short-lived token for API access.
   - **Refresh Token** → Long-lived token stored in Redis and as an HttpOnly cookie.

5. Save refresh token in Redis for validation during token refresh.
6. Return access token and user details in response.

**Example Response:**

```json
{
  "success": true,
  "status": 200,
  "message": "Token generated successfully",
  "data": [
    {
      "token": "<jwt_access_token>",
      "userId": "1234567890",
      "userName": "John Doe",
      "role": "user",
      "email": "john@example.com"
    }
  ]
}
```

---

### Refresh Token (`/refreshToken`)

```ts
router.post('/refreshToken', async (req: Request, res: Response) => { ... });
```

**Purpose:** Generate new JWT access token when the **current token expires**.

**Flow:**

1. Read `refresh_token` from `req.cookies`.
2. Verify refresh token using `verifyRefreshedToken`.
3. Handle possible errors:

   - Missing refresh token → `401 Unauthorized`.
   - Expired token → clear cookie, delete Redis entry, `403 Forbidden`.
   - Invalid token → `403 Forbidden`.

4. Compare token from Redis to prevent reuse of old tokens.
5. Generate a new JWT access token.
6. Rotate the refresh token: generate a new one and store in Redis.
7. Set refresh token in **HttpOnly cookie** and return new access token.

**Security Tip:** Rotating refresh tokens helps prevent token replay attacks.

---

### Show Profile (`/showProfile`)

```ts
router.post('/showProfile', async (req: Request, res: Response) => { ... });
```

**Purpose:** Fetch user profile data for authenticated users.

**Flow:**

1. Validate `req.body.params` contains `userId`.
2. Fetch user from MongoDB by `_id`.
3. Return user profile data or `404` if not found.
4. Requires authentication (`verifyJwtToken` middleware).

**Example Request:**

```json
{
  "params": {
    "userId": "1234567890"
  }
}
```

---

## JWT & Refresh Token Flow

1. **Login:**

   - Generate **JWT access token** (short-lived, e.g., 15 min)
   - Generate **refresh token** (long-lived, e.g., 7 days)
   - Store refresh token in Redis and as HttpOnly cookie.

2. **Access Token Expired:**

   - Frontend calls `/refreshToken`
   - Refresh token is verified → issue new access token and refresh token.
   - Old refresh token invalidated in Redis.

3. **Refresh Token Expired or Missing:**

   - User must login again.
   - Cookie cleared from browser, Redis entry deleted.

---

## Redis Token Storage

- Refresh tokens are stored in Redis as:

  ```
  refresh_token:<userId> → { token: "<refresh_token>" }
  ```

- Benefits:

  - Fast access for validation.
  - Can invalidate all tokens for a user instantly.
  - Prevents token reuse attacks.

---

## Error Handling

- Proper HTTP status codes used:

  - `400` → Bad request / missing params
  - `401` → Unauthorized / no refresh token
  - `403` → Forbidden / invalid or expired token
  - `404` → User not found
  - `500` → Internal server error

- Always returns JSON object with:

  ```json
  {
    "success": false,
    "status": 500,
    "message": "Error message",
    "data": []
  }
  ```

---

## Security Considerations

1. **HttpOnly Cookie** → Prevent JavaScript access to refresh token.
2. **JWT Verification** → Access tokens validated using `verifyJwtToken`.
3. **Refresh Token Rotation** → Each refresh replaces the old token.
4. **Redis Validation** → Prevents stolen token reuse.
5. **Password Hashing** → All passwords hashed before storage using `hashPassword`.

---

## Conclusion

- The user routes implement **secure authentication**, **refresh token rotation**, and **profile management**.
- Handles all common real-world scenarios:

  - Token expiry
  - Missing / invalid tokens
  - Redis token mismatch

- Suitable for a **production-ready MERN backend**.
- Beginner-friendly structure with **clear separation of concerns**:

  - Utilities: hashing, JWT, validation
  - Redis storage
  - CRUD operations

---

```

```

# Logout API Documentation

### Endpoint

**POST** `/api/auth/logout`

---

### Purpose

Logs out the user by clearing the refresh token stored in the cookie.

---

### Flow

1. Clear the `refresh_token` cookie from the client.
2. Optionally, you can delete the refresh token from Redis for extra security (not implemented in this code).
3. Return a success message confirming logout.
4. Handles internal errors gracefully with proper status codes.

---

### Request Body

No parameters are required for logout. The endpoint relies on the cookie `refresh_token` if used.

**Example Request:**

```http
POST /api/auth/logout
\

### Example Response (Success)
{
  "success": true,
  "status": 200,
  "message": "Logged out successfully",
  "data": []
}

### Example Response (Error)
{
  "success": false,
  "status": 500,
  "message": "Internal Server Error",
  "data": []
}
```
