
import jwt, { SignOptions } from 'jsonwebtoken';
import dotenv from 'dotenv';
import { NextFunction, Request, Response } from 'express';
dotenv.config();

let JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'default_access_secret';
let JWT_ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';

let JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'default_refresh_secret';
let JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

interface jwtPayLoad {
    id: string;
    email: string;
    role: string;
}

// Generate JWT Token
export function generateJwtToken(payLoad: jwtPayLoad): Object | undefined {
    try {
        const token = jwt.sign(payLoad, JWT_ACCESS_SECRET, { expiresIn: JWT_ACCESS_EXPIRY } as SignOptions);
        if (!token) {
            return { success: false, status: 400, message: "Token generation failed", data: [] }
        }
        return { success: true, status: 200, message: "Token generated successfully", token: token }
    }
    catch (error) {
        return { success: false, status: 500, message: "Internal server error", data: [] };
    }


}

// Verify JWT Token
export function verifyJwtToken(req: Request, res: Response, next: NextFunction): Object | null | undefined {
    try {
        // read header as a string and fallback to req.get which is available on Express Request
        const authHeader = (req.headers['authorization'] as string) || req.get('authorization');
        const token = authHeader ? authHeader : undefined;
        if (!token) {
            return res.json({ success: false, status: 401, message: "Unauthorized", data: [] });
        }

        const decoded = jwt.verify(token, JWT_ACCESS_SECRET) as jwtPayLoad;
        if (!decoded) {
            return res.json({ success: false, status: 401, message: "Unauthorized", data: [] });
        }

        // attach decoded payload to the request and continue
        (req as any).user = decoded;
        next();
        // return null;
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return res.json({ success: false, status: 401, message: message || "Internal server error", data: [] });
    }
}

// Refresh JWT Secret and Expiry from Environment Variables
export function generateRefereshedToken(payLoad: jwtPayLoad): Object | undefined {
    try {
        const token = jwt.sign(payLoad, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRY } as SignOptions);
        if (!token) {
            return { success: false, status: 400, message: "Token generation failed", data: [] }
        }
        return { success: true, status: 200, message: "Token generated successfully", token: token }
    }
    catch (error) {
        return { success: false, status: 500, message: "Internal server error", data: [] };
    }
}

// Verify Refresh JWT Token
export function verifyRefreshedToken1(req: Request, res: Response, next: NextFunction): Object | null | undefined {
    try {
        const cookies = req.cookies.refresh_token as string | undefined;
        if (!cookies) {
            return res.json({ success: false, status: 400, message: "refresh token was missed", data: [] });
        }
        const decoded = jwt.verify(cookies, JWT_REFRESH_SECRET) as jwtPayLoad;
        if (!decoded) {
            return res.json({ success: false, status: 401, message: "Unauthorized", data: [] });
        }
        next();
    } catch (error) {
        return { success: false, status: 500, message: "Internal server error", data: [] };
    }
}


// Verify Refresh JWT Token
export function verifyRefreshedToken(token: string): Object | null | undefined {
    try {
        if (!token) {
            return { success: false, status: 400, message: "refresh token was missed", data: [] };
        }
        const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as jwtPayLoad;
        if (!decoded) {
            return { success: false, status: 401, message: "Unauthorized", data: [] };
        }
        return { success: true, status: 200, message: "Successfully verified", data: decoded };
    } catch (error) {
        return { success: false, status: 500, message: "Internal server error", data: [] };
    }
}

