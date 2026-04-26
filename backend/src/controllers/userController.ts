import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { handleError } from '../utils/errorHandler';
import User, { IUser } from '../models/User';
import College, { ICollege } from '../models/College';

export const listUsers = async (req: AuthRequest, res: Response) => {
  try {
    const myRoles = req.user?.roles || [];
    const isRequesterAdmin = myRoles.includes('admin');
    
    let query: any = { college_id: req.user?.college_id };
    
    // Faculty only see members of THEIR department
    if (!isRequesterAdmin) {
        const myDept = (req.user as any).department;
        if (myDept) {
            query.department = myDept;
        } else {
            // If faculty has no department, they see nobody (safety fallback)
            return res.json([]);
        }
    }

    const users = await User.find(query);
    res.json(users);
  } catch (err) {
    handleError(res, err);
  }
};

export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const { fullName, email, password, department, branch, phone, role } = req.body;
    const myRoles = req.user?.roles || [];
    const isRequesterAdmin = myRoles.includes('admin');
    const isRequesterFaculty = myRoles.some(r => ['principal', 'ed', 'hod', 'advisor'].includes(r));

    // Only admins or faculty can create users
    if (!isRequesterAdmin && !isRequesterFaculty) {
        return res.status(403).json({ error: 'You do not have permission to create users' });
    }

    if (!department || !branch) {
      return res.status(400).json({ error: 'Department and branch are mandatory' });
    }

    // Faculty can only create student accounts for THEIR department
    let finalDepartment = department;
    if (!isRequesterAdmin) {
        if (role !== 'student') {
            return res.status(403).json({ error: 'You can only create student accounts' });
        }
        // Force the department to match the faculty's department
        finalDepartment = (req.user as any).department;
        if (!finalDepartment) {
            return res.status(400).json({ error: 'Your account has no department assigned. Please contact admin.' });
        }
    }

    const user = new User({
      full_name: fullName,
      email,
      password,
      department: finalDepartment,
      branch,
      phone,
      roles: [role],
      college_id: req.user?.college_id,
      must_change_password: true,
    });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    handleError(res, err, 400);
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, role, action } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (action === 'add') {
      if (!user.roles.includes(role)) user.roles.push(role);
    } else {
      user.roles = user.roles.filter((r) => r !== role);
    }
    await user.save();
    res.json(user);
  } catch (err) {
    handleError(res, err, 400);
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ error: 'User not found' });

    const myRoles = req.user?.roles || [];
    const isRequesterAdmin = myRoles.includes('admin');
    const isRequesterFaculty = myRoles.some(r => ['principal', 'ed', 'hod', 'advisor'].includes(r));
    
    // Only admins or faculty can delete users
    if (!isRequesterAdmin && !isRequesterFaculty) {
        return res.status(403).json({ error: 'You do not have permission to delete users' });
    }

    // Faculty can only delete students
    if (!isRequesterAdmin) {
        const isTargetPureStudent = targetUser.roles.length > 0 && targetUser.roles.every(r => r === 'student');
        if (!isTargetPureStudent) {
            return res.status(403).json({ error: 'You can only delete student accounts' });
        }
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    handleError(res, err);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { fullName, department, branch, phone } = req.body;
    const myRoles = req.user?.roles || [];

    // Students cannot change their own information
    if (myRoles.includes('student')) {
        return res.status(403).json({ error: 'Students cannot update their own profile information' });
    }

    if (!department || !branch) {
      return res.status(400).json({ error: 'Department and branch are necessary' });
    }
    const user = await User.findByIdAndUpdate(req.user?.id, {
      full_name: fullName,
      department,
      branch,
      phone,
    }, { new: true });
    res.json(user);
  } catch (err) {
    handleError(res, err, 400);
  }
};

export const updateUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { fullName, department, branch, phone } = req.body;
    const targetUserId = req.params.id;
    const myRoles = req.user?.roles || [];
    const isRequesterAdmin = myRoles.includes('admin');
    const isRequesterFaculty = myRoles.some(r => ['principal', 'ed', 'hod', 'advisor'].includes(r));

    if (!isRequesterAdmin && !isRequesterFaculty) {
        return res.status(403).json({ error: 'You do not have permission to update user profiles' });
    }

    if (!department || !branch) {
      return res.status(400).json({ error: 'Department and branch are necessary' });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) return res.status(404).json({ error: 'User not found' });

    // Faculty can only update students
    if (!isRequesterAdmin) {
        const isTargetPureStudent = targetUser.roles.length > 0 && targetUser.roles.every(r => r === 'student');
        if (!isTargetPureStudent) {
            return res.status(403).json({ error: 'You can only update student profiles' });
        }
    }

    const updatedUser = await User.findByIdAndUpdate(targetUserId, {
        full_name: fullName,
        department,
        branch,
        phone,
    }, { new: true });

    res.json(updatedUser);
  } catch (err) {
    handleError(res, err, 400);
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user?.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.password = password;
    user.must_change_password = false;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    handleError(res, err);
  }
};
