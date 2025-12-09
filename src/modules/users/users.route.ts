import express from 'express';
import { UserController } from './users.controller';
import auth from '../../middleware/auth';

const router = express.Router();

router.get('/', auth('admin'), UserController.getAll);
router.put('/:userId', auth('admin', 'customer'), UserController.updateProfile);
router.delete('/:userId', auth('admin'), UserController.deleteUser);

export const UserRoutes = router;
