import { Router, Request, Response } from 'express';
import { handleCrudOperation } from '../utils/handleCrudOperation';
import { validateUser } from '../utils/userValidation';
import { comparePassword, hashPassword } from '../utils/passwordUtils';
import { generateJwtToken, verifyJwtToken, generateRefereshedToken, verifyRefreshedToken } from '../middlewares/jwt';
import mongoose from 'mongoose';
import redisClient from '../config/redis';
import jwt from 'jsonwebtoken'

const router = Router();

//user registration
router.post('/userRegister', async (req: Request, res: Response) => {
    try {
        console.log('Received user registration request with body:', req.body);
        // Validate that req.body.params is not empty
        if (Object.keys(req.body.params).length === 0) {
            return res.status(400).json({ success: false, status: 400, message: 'params are required', data: [] });
        }
        // Validate required fields
        await validateUser(req, res, async () => { });
        let { name, email, password, role, phoneNumber, address } = req.body.params;
        //user exists check
        const existingUser = await handleCrudOperation('User', 'aggregate', [{ $match: { email: { $eq: email } } }]);
        if (Array.isArray(existingUser?.data) && existingUser.data.length > 0) {
            return res.status(400).json({ success: false, status: 400, message: 'User already exists', data: [] });
        }
        //hashed password
        const hashedPasswordResult = await hashPassword(password);
        if (!hashedPasswordResult.success) {
            return res.status(hashedPasswordResult.status).json(hashedPasswordResult);
        }

        // create user
        const result = await handleCrudOperation('User', 'insertOne', { name, email, password: hashedPasswordResult.data[0], role, phoneNumber, address });
        if (!result.success) {
            return res.status(result.status).json(result);
        }
        return res.status(201).json(result);

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return res.status(500).json({ success: false, status: 500, message: message || 'Internal Server Error', data: [] });
    }
});

//user Login
router.post("/userLogin", async (req: Request, res: Response) => {
    try {
        // Validate that req.body.params is not empty
        if (Object.keys(req.body.params).length === 0) {
            return res.status(400).json({ success: false, status: 400, message: 'params are required', data: [] });
        }
        const { email, password } = req.body.params;
        // Check if user exists
        let _filter = {
            "filter": [
                { $match: { email: email } }
            ]
        }
        const userResult = await handleCrudOperation('User', "aggregate", _filter.filter);
        if (!userResult.success || (userResult.data as any[]).length === 0) {
            return res.status(404).json({ success: false, status: 404, message: 'User not found', data: [] });
        }
        const hashedPassword = (userResult.data as any[])[0].password;
        let toValidateUser = await comparePassword(password, hashedPassword);
        if (!toValidateUser.success) {
            return res.status(toValidateUser.status).json(toValidateUser);
        }
        //generate jwt token
        const jwtPayload = {
            id: (userResult.data as any[])[0]._id,
            email: (userResult.data as any[])[0].email,
            role: (userResult.data as any[])[0].role
        };
        // Generate JWT Token
        const jwtToken = generateJwtToken(jwtPayload) as { token: { token: string } };
        if (!jwtToken) {
            return res.status(500).json({ success: false, status: 500, message: 'Failed to generate token', data: [] });
        }
        //refreshed token logic can be added here
        const refreshToken = generateRefereshedToken(jwtPayload) as { token: { token: string } };
        if (!refreshToken) {
            return res.status(500).json({ success: false, status: 500, message: 'Failed to generate refresh token', data: [] });
        }
        //refresh tokens are keep in reddis for fast opeations
        // Determine the correct token value safely

        if (!refreshToken.token) {
            return res.status(500).json({ success: false, status: 500, message: 'Refresh token is undefined', data: [] });
        }

        // Use the proper Redis key
        const redisKey = `refresh_token:${jwtPayload.id}`;
        await redisClient.set(redisKey, JSON.stringify(refreshToken), { EX: 7 * 24 * 60 * 60 * 1000 });

        // Optionally, set cookie
        res.cookie('refresh_token', refreshToken.token, {
            httpOnly: true,
            sameSite: 'strict',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        return res.status(200).json({ success: true, status: 200, message: 'Token generated successfully', data: [{ token: jwtToken.token, userId: (userResult.data as any[])[0]._id, userName: (userResult.data as any[])[0].name, role: (userResult.data as any[])[0].role, email: (userResult.data as any[])[0].email }] });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return res.status(500).json({ success: false, status: 500, message: message || 'Internal Server Error', data: [] });
    }
})

//when jwt token expried then call the refreshToken
router.post('/refreshToken', async (req: Request, res: Response) => {
    try {
        let decoded: any
        const refreshToken = req.cookies.refresh_token as string | undefined;
        if (!refreshToken) {
            return res.status(401).json({ succss: false, status: 401, message: "No refresh token provided please login again", data: [] });
        }
        try {
            //verify refresh token 
            decoded = verifyRefreshedToken(refreshToken)
            if (!decoded.success && decoded.status !== 200) {
                return res.status(decoded.status).json(decoded);

            }
        } catch (error: any) {
            if (error.name === "TokenExpiredError") {
                const payload = jwt.decode(refreshToken) as any;
                if (!payload) {
                    await redisClient.del(`refresh:${payload.id}`);
                }
                res.clearCookie("refresh_token", { httpOnly: true, secure: true, sameSite: "strict", path: "/" });
                return res.status(403).json({ message: "Refresh token expired. Please login again." });
            }
            return res.status(403).json({ message: "Invalid refresh token" });
        }
        const userId = decoded.data.id;
        // Compare to Redis-stored token
        const stored = await redisClient.get(`refresh_token:${userId}`);
        if (!stored) {
            return res.status(403).json({ message: "No refresh token stored" });
        }
        let storedObj: any;
        try {
            storedObj = JSON.parse(stored);
        } catch (e) {
            return res.status(500).json({ message: "Failed to parse stored refresh token" });
        }
        if (storedObj.token !== refreshToken) {
            return res.status(403).json({ message: "Refresh token mismatch" });
        }
        //generate jwt token
        const jwtPayload = {
            id: decoded.data.id,
            email: decoded.data.email,
            role: decoded.data.role
        };
        // Generate JWT Token
        const jwtToken = generateJwtToken(jwtPayload) as { token: { token: string } };
        if (!jwtToken) {
            return res.status(500).json({ success: false, status: 500, message: 'Failed to generate token', data: [] });
        }
        //refreshed token logic can be added here
        const generateRefreshToken = generateRefereshedToken(jwtPayload) as { token: { token: string } };
        if (!generateRefreshToken) {
            return res.status(500).json({ success: false, status: 500, message: 'Failed to generate refresh token', data: [] });
        }
        //refresh tokens are keep in reddis for fast opeations
        // Determine the correct token value safely

        if (!generateRefreshToken.token) {
            return res.status(500).json({ success: false, status: 500, message: 'Refresh token is undefined', data: [] });
        }

        // Use the proper Redis key
        const redisKey = `refresh_token:${jwtPayload.id}`;
        await redisClient.set(redisKey, JSON.stringify(generateRefreshToken), { EX: 7 * 24 * 60 * 60 * 1000 });

        // Optionally, set cookie
        res.cookie('refresh_token', generateRefreshToken.token, {
            httpOnly: true,
            sameSite: 'strict',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        return res.status(200).json({ success: true, status: 200, message: 'Token generated successfully', data: [{ token: jwtToken.token, userId: decoded._id, userName: decoded.name, role: decoded.role, email: decoded.email }] });

    } catch (error: any) {
        return res.status(500).json({ success: false, status: 500, message: "Internal Server Error", data: [] })
    }

})
router.use(verifyJwtToken)

// check user authentication
router.post('/showProfile', async (req: Request, res: Response) => {
    try {
        // validate the request body
        if (Object.keys(req.body.params).length === 0) {
            return res.status(400).json({ success: false, status: 400, message: 'params are required', data: [] });
        }
        const { userId } = req.body.params;
        // fetch user profile
        const userProfileResult = await handleCrudOperation('User', 'aggregate', [{ $match: { _id: new mongoose.Types.ObjectId(userId) } }]);
        if (!userProfileResult.success || (userProfileResult.data as any[]).length === 0) {
            return res.status(404).json({ success: false, status: 404, message: 'User not found', data: [] });
        }
        return res.status(200).json({ success: true, status: 200, message: 'User profile fetched successfully', data: userProfileResult.data });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return res.status(500).json({ success: false, status: 500, message: message || 'Internal Server Error', data: [] });
    }
})
    

//logout api here
router.post('/logout', async (req: Request, res: Response) => {
    try {
        res.clearCookie('refresh_token', {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
        })
        return res.status(200).json({ success: true, status: 200, message: 'Logged out successfully', data: [] });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return res.status(500).json({ success: false, status: 500, message: message || 'Internal Server Error', data: [] })
    }
})


export default router;