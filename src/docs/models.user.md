\*\*

- ============================================================
- 📘 USER MODEL DOCUMENTATION
- ============================================================
-
- 📁 File: src/models/user.model.ts
- 🧠 Purpose: Defines the schema, structure, and validation rules
-             for the "User" collection in MongoDB using Mongoose.
-
- ============================================================
- 🔍 OVERVIEW
- ***
- The User model is responsible for storing and managing all
- registered user data in the system. It is designed with
- security, scalability, and role-based access control in mind.
-
- Each document in the "User" collection contains:
- - Basic details like name, email, and phone number
- - Authentication credentials (hashed password)
- - Role-based permissions (admin, user)
- - Account status and activity flag
- - Metadata tracking for creation and modification
-
- ============================================================
- 🧩 SCHEMA STRUCTURE
- ***
- \_id : Unique ObjectId for each user
- name : Full name (3–50 characters, trimmed)
- email : Unique lowercase email ID, required for login
- password : Hashed password (4–100 chars, never plain text)
- role : Defines user type → ['user', 'admin']
- phoneNumber : Unique contact number (used for verification/login)
- isActive : Boolean flag to indicate if account is active
- address : Optional string field for residential address
- createdBy : Reference (ObjectId) to the user who created this record
- modifiedBy : Reference (ObjectId) to the user who last modified this record
- createdAt : Auto-generated creation timestamp
- updatedAt : Auto-generated last updated timestamp
-
- ============================================================
- ⚙️ VALIDATIONS & DEFAULTS
- ***
- - name : Required, 3–50 chars, trimmed
- - email : Required, unique, lowercase, trimmed
- - password : Required, 4–100 chars, trimmed
- - role : Must be either 'user' or 'admin'
- - phoneNumber : Required, unique number
- - isActive : Defaults to `true`
- - address : Optional, defaults to empty string
-
- ============================================================
- 🧱 INDEXES
- ***
- Indexes are added to improve query performance and enforce
- uniqueness constraints on critical fields.
-
- userSchema.index({ email: 1 }); // For faster login lookup
- userSchema.index({ phoneNumber: 1 }); // For uniqueness validation
-
- ============================================================
- 🔐 SECURITY NOTES
- ***
- - Passwords should always be hashed before saving to MongoDB.
- - Passwords must not be exposed in any API responses.
- - Implement access control based on the `role` field using middleware.
- - Use authentication mechanisms (JWT/Cookies) for secure access.
-
- ============================================================
- 🧠 FUTURE ENHANCEMENTS
- ***
- ✅ Add bcrypt password hashing (pre-save hook)
- ✅ Add comparePassword() method for login validation
- ✅ Add profile avatar field
- ✅ Add soft-delete flag (e.g., `isDeleted: boolean`)
- ✅ Track user activity (e.g., `lastLogin`, `loginAttempts`)
-
- ============================================================
- 🧩 EXAMPLE DOCUMENT
- ***
- {
- "\_id": "64f8e8e9d47b4a84b1c09b55",
- "name": "Prathap Kunarapu",
- "email": "prathap@example.com",
- "password": "$2b$10$UJXoyFmgH8VgH8FJ3f8VZ...",
- "role": "admin",
- "phoneNumber": 9876543210,
- "isActive": true,
- "address": "Hyderabad, India",
- "createdBy": "64f8e8e9d47b4a84b1c09b55",
- "modifiedBy": null,
- "createdAt": "2025-10-23T09:30:00.000Z",
- "updatedAt": "2025-10-23T09:30:00.000Z"
- }
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

interface User {
\_id: mongoose.Types.ObjectId;
name: string;
email: string;
password: string;
role: string;
phoneNumber: number;
isActive: boolean;
createdAt?: Date;
updatedAt?: Date;
modifiedBy?: mongoose.Types.ObjectId;
createdBy?: mongoose.Types.ObjectId;
address?: string;
}

const userSchema = new mongoose.Schema<User>(
{
\_id: { type: mongoose.Schema.Types.ObjectId, required: true },
name: {
type: String,
required: true,
minLength: 3,
maxLength: 50,
trim: true,
},
email: {
type: String,
required: true,
unique: true,
lowercase: true,
trim: true,
},
password: {
type: String,
required: true,
minLength: 4,
maxLength: 100,
trim: true,
},
role: { type: String, required: true, enum: ['user', 'admin'] },
phoneNumber: { type: Number, required: true, unique: true },
isActive: { type: Boolean, default: true },
address: { type: String, default: '', maxLength: 200, trim: true },
createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
},
{ timestamps: true }
);

// 🧱 Indexes
userSchema.index({ email: 1 });
userSchema.index({ phoneNumber: 1 });

export const UserModel = mongoose.model<User>('User', userSchema);
