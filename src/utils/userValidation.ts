import joi from 'joi';
import { Request, Response } from 'express';
const userSchema = joi.object({
    name: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().min(6).required(),
    role: joi.string().required(),
    phoneNumber: joi.number().integer().min(1000000000).max(9999999999).required(), // 10-digit phone
    address: joi.string().max(200).optional(),
});

export const validateUser = (req: Request, res: Response, next: Function) => {

    const { error } = userSchema.validate(req.body.params);
    if (error) {
        return res.status(400).json({ success: false, status: 400, message: error.details[0].message, data: [] });
    }
    next();
}
