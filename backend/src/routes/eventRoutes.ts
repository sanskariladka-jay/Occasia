import { Router } from 'express';
import { listEvents, createEvent, updateEventStatus, getEventDetail } from '../controllers/eventController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', listEvents);
router.get('/:id', getEventDetail);
router.post('/', createEvent);
router.patch('/:id/status', updateEventStatus);

export default router;
