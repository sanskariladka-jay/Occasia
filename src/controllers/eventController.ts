import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Event, { IEvent } from '../models/Event';
import Approval, { IApproval } from '../models/Approval';
import User, { IUser } from '../models/User';
import { handleError } from '../utils/errorHandler';

export const listEvents = async (req: AuthRequest, res: Response) => {
  try {
    const events = await Event.find({ college_id: req.user?.college_id })
      .populate('creator_id', 'full_name')
      .sort('-createdAt');
    res.json(events);
  } catch (err) {
    handleError(res, err);
  }
};

export const createEvent = async (req: AuthRequest, res: Response) => {
  try {
    const { 
      title, description, venue, start_date, end_date, 
      contact_name, contact_email, contact_phone, banner_url 
    } = req.body;

    const myRoles = req.user?.roles || [];
    const isStaff = myRoles.some(r => ['admin', 'principal', 'ed', 'hod', 'advisor'].includes(r));

    const event = new Event({
      title,
      description,
      venue,
      start_date,
      end_date,
      contact_name,
      contact_email,
      contact_phone,
      banner_url,
      college_id: req.user?.college_id,
      creator_id: req.user?.id,
      status: isStaff ? 'approved' : 'advisor_pending',
    });
    await event.save();

    const initialApproval = new Approval({
      event_id: event._id,
      actor_id: req.user?.id,
      actor_role: myRoles[0] || 'student',
      action: isStaff ? 'approved' : 'submitted',
      comment: isStaff ? 'Auto-approved for staff' : null,
    });
    await initialApproval.save();

    res.status(201).json(event);
  } catch (err) {
    handleError(res, err, 400);
  }
};

export const getEventDetail = async (req: AuthRequest, res: Response) => {
  try {
    const event = await Event.findById(req.params.id).populate('creator_id', 'full_name email department');
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const approvals = await Approval.find({ event_id: req.params.id })
      .populate('actor_id', 'full_name email');

    res.json({ event, approvals });
  } catch (err) {
    handleError(res, err);
  }
};

export const updateEventStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status, action, comment } = req.body;
    const myRoles = req.user?.roles || [];

    // Record the action
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    // Validate if the user has the required role for the current stage
    const currentStatus = event.status;
    const stageRoleMap: Record<string, string> = {
        'advisor_pending': 'advisor',
        'hod_pending': 'hod',
        'ed_pending': 'ed',
        'principal_pending': 'principal'
    };

    const requiredRole = stageRoleMap[currentStatus];
    if (requiredRole && !myRoles.includes(requiredRole) && !myRoles.includes('admin')) {
        return res.status(403).json({ error: `Only ${requiredRole}s or admins can take action at this stage` });
    }

    event.status = status;
    if (status === 'cancelled') event.cancellation_reason = comment;
    await event.save();

    const approval = new Approval({
      event_id: event._id,
      actor_id: req.user?.id,
      actor_role: myRoles.find(r => r === requiredRole) || myRoles[0],
      action: action || (status === 'rejected' ? 'rejected' : status === 'cancelled' ? 'cancelled' : 'approved'),
      comment,
    });
    await approval.save();

    res.json(event);
  } catch (err) {
    handleError(res, err, 400);
  }
};
