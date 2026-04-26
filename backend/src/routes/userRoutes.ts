import { Router } from 'express';
import { listUsers, createUser, updateUserRole, deleteUser, updateProfile, updateUserProfile, changePassword } from '../controllers/userController';
import { authenticate, isAdmin } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, listUsers);
router.post('/', authenticate, createUser);
router.patch('/roles', authenticate, isAdmin, updateUserRole);
router.delete('/:id', authenticate, deleteUser);
router.patch('/:id/profile', authenticate, updateUserProfile);
router.patch('/me/profile', authenticate, updateProfile);
router.post('/me/change-password', authenticate, changePassword);

export default router;
