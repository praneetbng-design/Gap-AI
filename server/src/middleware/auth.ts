import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { dbStore } from '../database/store.js';
import { UserRole } from '../types/index.js';

export interface AuthUser {
  userId: string;
  username: string;
  email: string;
  role: UserRole;
  fullName: string;
  mustChangePassword: boolean;
  studentId?: string;
  teacherId?: string;
  mentorId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function generateToken(payload: AuthUser): string {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' });
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AuthUser;
    
    // Check if user still exists
    const user = dbStore.getUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User account not found.' });
    }

    // Attach latest info
    decoded.mustChangePassword = user.mustChangePassword;

    // Enrich with role specific IDs
    if (decoded.role === 'student') {
      const student = dbStore.getStudentByUserId(decoded.userId);
      if (student) decoded.studentId = student.id;
    } else if (decoded.role === 'teacher') {
      const teacher = dbStore.getTeacherByUserId(decoded.userId);
      if (teacher) decoded.teacherId = teacher.id;
    } else if (decoded.role === 'mentor') {
      const mentor = dbStore.getMentorByUserId(decoded.userId);
      if (mentor) decoded.mentorId = mentor.id;
    }

    req.user = decoded;

    // Check if password change is mandatory
    const isChangePasswordRoute = req.originalUrl.includes('/api/auth/change-password') || req.originalUrl.includes('/api/auth/me') || req.originalUrl.includes('/api/auth/logout');
    if (decoded.mustChangePassword && !isChangePasswordRoute) {
      return res.status(403).json({
        error: 'Password change required before accessing academic portals.',
        mustChangePassword: true
      });
    }

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Access denied. Requires one of: ${roles.join(', ')}.` });
    }
    next();
  };
}
