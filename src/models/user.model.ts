import mongoose from 'mongoose';

interface User {
    _id: mongoose.Types.ObjectId;
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
        _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
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
        role: { type: String, required: true, enum: ['user', 'admin', 'Developer'] },
        phoneNumber: { type: Number, required: true, unique: true },
        isActive: { type: Boolean, default: true },
        address: { type: String, default: '', maxLength: 200, trim: true },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);



export const UserModel = mongoose.model<User>('User', userSchema);
