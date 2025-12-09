import { Request, Response } from 'express';
import { UserService } from './users.service';
import { JwtPayload } from 'jsonwebtoken';

const getAll = async (req: Request, res: Response) => {
    try {
        const result = await UserService.getAllUsers();
        res.status(200).json({
            success: true,
            message: 'Users retrieved successfully',
            data: result.rows,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
            error: error,
        });
    }
};

const updateProfile = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const user = req.user as JwtPayload;
        const { name, email, phone, role } = req.body;

        if (!userId) {
            throw new Error('User ID is required');
        }

        if (user.role !== 'admin' && Number(userId) !== user.id) {
            throw new Error('You are not authorized to update this profile');
        }

        const result = await UserService.updateUser(
          Number(userId),
          name,
          email,
          phone,
          role
        );


        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: result,
        });
    } catch (error: any) {
        const statusCode = error.message === 'You are not authorized to update this profile' ? 403 : 400;
        res.status(statusCode).json({
            success: false,
            message: error.message,
            error: error,
        });
    }
};

const deleteUser = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            throw new Error('User ID is required');
        }
        await UserService.deleteUser(parseInt(userId as string));
        res.status(200).json({
            success: true,
            message: 'User deleted successfully',
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message,
            error: error,
        });
    }
};

export const UserController = {
    getAll,
    updateProfile,
    deleteUser,
};
