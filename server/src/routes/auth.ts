import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { dbStore } from '../database/store.js';
import { generateToken, requireAuth } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { portal, identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Username/Identifier and password are required.' });
    }

    const cleanId = String(identifier).trim();
    const cleanPass = String(password).trim();

    let targetUser: any = null;

    if (portal === 'student') {
      // Find student by exact name (case-insensitive) OR by USN
      const studentByUsn = dbStore.getStudentByUsn(cleanId);
      if (studentByUsn) {
        targetUser = dbStore.getUserById(studentByUsn.userId);
      } else {
        // Search by username / full name
        const allUsers = dbStore.getRawData().users;
        targetUser = allUsers.find(
          u => u.role === 'student' &&
          (u.username.toLowerCase() === cleanId.toLowerCase() || u.fullName.toLowerCase() === cleanId.toLowerCase())
        );
      }

      if (!targetUser) {
        return res.status(401).json({ error: 'Student not found in roster. Please verify your exact name or USN.' });
      }
    } else if (portal === 'teacher') {
      const allUsers = dbStore.getRawData().users;
      const term = cleanId.toLowerCase().replace(/@.*$/, '').replace(/[^a-z0-9]/g, '');
      targetUser = allUsers.find(u => u.role === 'teacher' && (
        u.email.toLowerCase() === cleanId.toLowerCase() ||
        u.username.toLowerCase() === cleanId.toLowerCase() ||
        u.fullName.toLowerCase() === cleanId.toLowerCase() ||
        u.fullName.toLowerCase().includes(cleanId.toLowerCase()) ||
        u.email.toLowerCase().includes(term) ||
        u.username.toLowerCase().includes(term)
      ));
      if (!targetUser) {
        return res.status(401).json({ error: 'Invalid teacher credentials or account not authorized for Teacher Portal.' });
      }
    } else if (portal === 'mentor') {
      const allUsers = dbStore.getRawData().users;
      const term = cleanId.toLowerCase().replace(/@.*$/, '').replace(/[^a-z0-9]/g, '');
      targetUser = allUsers.find(u => u.role === 'mentor' && (
        u.email.toLowerCase() === cleanId.toLowerCase() ||
        u.username.toLowerCase() === cleanId.toLowerCase() ||
        u.fullName.toLowerCase() === cleanId.toLowerCase() ||
        u.fullName.toLowerCase().includes(cleanId.toLowerCase()) ||
        u.email.toLowerCase().includes(term) ||
        u.username.toLowerCase().includes(term)
      ));
      if (!targetUser) {
        return res.status(401).json({ error: 'Invalid mentor credentials or account not authorized for Mentor Portal.' });
      }
    } else if (portal === 'admin') {
      targetUser = dbStore.getUserByEmail(cleanId) || dbStore.getUserByUsername(cleanId);
      if (!targetUser || targetUser.role !== 'admin') {
        return res.status(401).json({ error: 'Invalid administrator credentials.' });
      }
    } else {
      return res.status(400).json({ error: 'Invalid portal specified. Must be student, teacher, mentor, or admin.' });
    }

    // Verify Password
    const passwordValid = await bcrypt.compare(cleanPass, targetUser.passwordHash);
    if (!passwordValid) {
      return res.status(401).json({ error: 'Incorrect password. For first-time student login, your password is your USN.' });
    }

    // Role-specific enrichment
    let studentInfo = null;
    let teacherInfo = null;
    let mentorInfo = null;

    if (targetUser.role === 'student') {
      studentInfo = dbStore.getStudentByUserId(targetUser.id);
    } else if (targetUser.role === 'teacher') {
      teacherInfo = dbStore.getTeacherByUserId(targetUser.id);
    } else if (targetUser.role === 'mentor') {
      mentorInfo = dbStore.getMentorByUserId(targetUser.id);
    }

    const tokenPayload = {
      userId: targetUser.id,
      username: targetUser.username,
      email: targetUser.email,
      role: targetUser.role,
      fullName: targetUser.fullName,
      mustChangePassword: targetUser.mustChangePassword,
      studentId: studentInfo?.id,
      teacherId: teacherInfo?.id,
      mentorId: mentorInfo?.id
    };

    const token = generateToken(tokenPayload);

    // Audit Log
    dbStore.addAuditLog(targetUser.id, 'LOGIN', 'USER', targetUser.id, { portal, role: targetUser.role });

    return res.json({
      token,
      user: {
        id: targetUser.id,
        username: targetUser.username,
        email: targetUser.email,
        role: targetUser.role,
        fullName: targetUser.fullName,
        mustChangePassword: targetUser.mustChangePassword
      },
      student: studentInfo,
      teacher: teacherInfo,
      mentor: mentorInfo
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error during authentication.' });
  }
});

// POST /api/auth/change-password
router.post('/change-password', requireAuth, async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both current password and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    const user = dbStore.getUserById(req.user!.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Check current password
    const valid = await bcrypt.compare(String(currentPassword).trim(), user.passwordHash);
    if (!valid) {
      return res.status(400).json({ error: 'Current password does not match.' });
    }

    // Check student did not set password back to their USN
    if (user.role === 'student') {
      const student = dbStore.getStudentByUserId(user.id);
      if (student && newPassword.trim().toUpperCase() === student.usn.toUpperCase()) {
        return res.status(400).json({ error: 'You cannot use your USN as your permanent password. Please choose a secure password.' });
      }
    }

    const newHash = await bcrypt.hash(newPassword.trim(), 10);
    dbStore.updateUser(user.id, {
      passwordHash: newHash,
      mustChangePassword: false
    });

    dbStore.addAuditLog(user.id, 'PASSWORD_CHANGE', 'USER', user.id);

    return res.json({
      success: true,
      message: 'Password changed successfully! You may now access the full platform.'
    });
  } catch (err: any) {
    console.error('Password change error:', err);
    return res.status(500).json({ error: 'Failed to update password.' });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, (req: Request, res: Response) => {
  const user = dbStore.getUserById(req.user!.userId);
  if (!user) return res.status(404).json({ error: 'User not found.' });

  const { passwordHash, ...safeUser } = user;
  let student = null;
  let teacher = null;
  let mentor = null;

  if (user.role === 'student') {
    student = dbStore.getStudentByUserId(user.id);
  } else if (user.role === 'teacher') {
    teacher = dbStore.getTeacherByUserId(user.id);
  } else if (user.role === 'mentor') {
    mentor = dbStore.getMentorByUserId(user.id);
  }

  return res.json({
    user: safeUser,
    student,
    teacher,
    mentor
  });
});

export default router;
