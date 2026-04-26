import { Router } from 'express';
import { login, registerCollege, getMe, listColleges } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/login', login);
router.post('/register-college', registerCollege);
router.get('/colleges', listColleges);
router.get('/me', authenticate, getMe);

export default router;
