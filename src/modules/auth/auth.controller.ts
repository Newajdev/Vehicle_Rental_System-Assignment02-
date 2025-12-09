import { Request, Response } from 'express';
import { AuthService } from './auth.service';

const signup = async (req: Request, res: Response) => {
    try {
        const result = await AuthService.registerUser(req.body);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: result.rows[0],
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message,
            error: error,
        });
    }
};

const signin = async (req: Request, res: Response) => {
    try {
        const result = await AuthService.loginUser(req.body);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: result,
        });
    } catch (error: any) {
        const statusCode = error.message === 'User not found' || error.message === 'Invalid password' ? 401 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.message,
            error: error,
        });
    }
};

export const AuthController = {
    signup,
    signin,
};
