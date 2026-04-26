import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    roles: string[];
    college_id: string;
    department?: string;
  };
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({
      error: "No token provided"
    });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as {
      id: string;
      roles: string[];
      college_id: string;
      department?: string;
    };

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      error: "Invalid token"
    });
    return;
  }
};

export const isAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user && req.user.roles.includes("admin")) {
    next();
    return;
  }

  res.status(403).json({
    error: "Admin access required"
  });
};