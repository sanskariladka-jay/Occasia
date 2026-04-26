import { Request, Response, NextFunction } from 'express';
import College from '../models/College';

export const getCollegeStructure = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { collegeId } = req.query;
    let college;
    if (collegeId) {
      college = await College.findById(collegeId);
    } else {
      college = await College.findOne(); 
    }

    if (!college) {
      return res.status(404).json({ message: "College structure not found" });
    }

    // Bootstrap defaults if empty
    if (!college.departments || college.departments.length === 0) {
      college.departments = [
        { name: "Computer Science & Engineering", branches: ["AI & ML", "Data Science", "Cyber Security", "Full Stack Web"] },
        { name: "Electronics & Communication", branches: ["VLSI Design", "Embedded Systems", "Robotics"] },
        { name: "Mechanical Engineering", branches: ["Automotive Engineering", "Thermal Power", "Robotics & Automation"] },
        { name: "Information Technology", branches: ["Cloud Computing", "Software Engineering"] },
        { name: "Electrical Engineering", branches: ["Power Systems", "Control Systems"] },
        { name: "Civil Engineering", branches: ["Structural Engineering", "Environmental Engineering"] },
        { name: "Business Administration", branches: ["Finance", "Marketing", "Human Resources"] }
      ];
      await college.save();
    }

    res.json({
      name: college.name,
      departments: college.departments
    });
  } catch (err) {
    next(err);
  }
};

export const updateStructure = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { departments } = req.body;
    if (!Array.isArray(departments)) {
      return res.status(400).json({ message: "Departments must be an array" });
    }

    const college = await College.findOne();
    if (!college) {
      return res.status(404).json({ message: "College not found" });
    }

    college.departments = departments;
    await college.save();

    res.json({ message: "College structure updated successfully", departments: college.departments });
  } catch (err) {
    next(err);
  }
};
