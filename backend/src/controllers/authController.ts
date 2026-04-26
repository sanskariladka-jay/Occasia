import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import College, { ICollege } from '../models/College';
import { AuthRequest } from '../middleware/auth';
import { handleError } from '../utils/errorHandler';

export const registerCollege = async (req: Request, res: Response) => {
  try {
    const { collegeName, collegeCode, adminName, adminEmail, adminPassword, address, contactPhone } = req.body;

    const college = new College({
      name: collegeName,
      code: collegeCode.toUpperCase(),
      contact_email: adminEmail,
      address: address,
      contact_phone: contactPhone,
    });
    await college.save();

    const admin = new User({
      full_name: adminName,
      email: adminEmail,
      password: adminPassword,
      college_id: college._id,
      roles: ['admin'],
    });
    await admin.save();

    res.status(201).json({ message: 'College and admin created successfully' });
  } catch (err) {
    handleError(res, err, 400);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).populate('college_id');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, roles: user.roles, college_id: user.college_id?._id, department: user.department },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        full_name: user.full_name,
        email: user.email,
        roles: user.roles,
        college: user.college_id,
        must_change_password: user.must_change_password,
      },
    });
  } catch (err) {
    handleError(res, err);
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id).populate('college_id');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    handleError(res, err);
  }
};

export const listColleges = async (req: Request, res: Response) => {
  try {
    const colleges = await College.find({}).sort('name');
    res.json(colleges);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
