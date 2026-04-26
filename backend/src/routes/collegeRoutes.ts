import { Router } from 'express';
import * as collegeController from '../controllers/collegeController';
import { authenticate, isAdmin } from '../middleware/auth';

const router = Router();

// Publicly readable (for registration)
router.get('/structure', collegeController.getCollegeStructure);

// Admin-only management
router.post('/structure', authenticate, isAdmin, collegeController.updateStructure);

export default router;
