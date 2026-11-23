import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import xlsx from 'xlsx';
import fs from 'fs';
import { dbStore } from '../database/store.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { randomUUID } from 'crypto';

const router = Router();
router.use(requireAuth);
router.use(requireRole('admin'));

// GET /api/admin/dashboard
router.get('/dashboard', (_req: Request, res: Response) => {
  const students = dbStore.listStudents();
  const teachers = dbStore.listTeachers();
  const mentors = dbStore.listMentors();
  const subjects = dbStore.listSubjects();
  const assessments = dbStore.listAssessments();
  const reconciliationIssues = dbStore.getReconciliationIssues();
  const auditLogs = dbStore.getAuditLogs(10);

  return res.json({
    institution: {
      name: 'Dr. T. Thimmaiah Institute of Technology',
      department: 'Computer Science and Engineering (Artificial Intelligence and Machine Learning)',
      code: 'CSE-AIML',
      semester: 5,
      academicYear: '2026-27'
    },
    counts: {
      students: students.length,
      activeStudents: students.filter(s => s.enrollmentStatus === 'Active').length,
      provisionalStudents: students.filter(s => s.enrollmentStatus === 'Provisional').length,
      teachers: teachers.length,
      mentors: mentors.length,
      subjects: subjects.length,
      assessments: assessments.length,
      reconciliationPending: reconciliationIssues.filter(i => i.status === 'Pending' || i.status === 'Provisional').length
    },
    reconciliationIssues,
    recentAuditLogs: auditLogs
  });
});

// GET /api/admin/students
router.get('/students', (req: Request, res: Response) => {
  const { search, status, batch } = req.query;
  let students = dbStore.listStudents();

  if (search) {
    const q = String(search).toLowerCase();
    students = students.filter(s => s.fullName.toLowerCase().includes(q) || s.usn.toLowerCase().includes(q));
  }
  if (status) {
    students = students.filter(s => s.enrollmentStatus === status);
  }
  if (batch) {
    students = students.filter(s => s.mentorBatch === batch);
  }

  return res.json(students);
});

// POST /api/admin/students/:id/reset-password
router.post('/students/:id/reset-password', async (req: Request, res: Response) => {
  const { id } = req.params;
  const student = dbStore.getStudentById(id);
  if (!student) return res.status(404).json({ error: 'Student not found.' });

  // Reset password back to USN temporary password
  const newHash = await bcrypt.hash(student.usn, 10);
  dbStore.updateUser(student.userId, {
    passwordHash: newHash,
    mustChangePassword: true
  });

  dbStore.addAuditLog(req.user!.userId, 'RESET_PASSWORD', 'STUDENT', student.id, { usn: student.usn });

  return res.json({
    success: true,
    message: `Password reset to temporary USN "${student.usn}". Force-change flag enabled.`
  });
});

// GET /api/admin/teachers
router.get('/teachers', (_req: Request, res: Response) => {
  return res.json(dbStore.listTeachers());
});

// GET /api/admin/mentors
router.get('/mentors', (_req: Request, res: Response) => {
  return res.json(dbStore.listMentors());
});

// GET /api/admin/subjects
router.get('/subjects', (_req: Request, res: Response) => {
  return res.json(dbStore.listSubjects());
});

// POST /api/admin/subjects
router.post('/subjects', (req: Request, res: Response) => {
  const { subjectName, courseCode, isLab, teacherName } = req.body;
  if (!subjectName || !courseCode) {
    return res.status(400).json({ error: 'Subject name and course code are required.' });
  }

  const existing = dbStore.getSubjectByCode(courseCode);
  if (existing) {
    return res.status(400).json({ error: `Subject with code ${courseCode} already exists.` });
  }

  const subject = {
    id: randomUUID(),
    subjectName,
    courseCode: courseCode.trim().toUpperCase(),
    department: 'CSE-AIML',
    semester: 5,
    isLab: Boolean(isLab),
    teacherName: teacherName || 'Unassigned'
  };

  dbStore.getRawData().subjects.push(subject);
  dbStore.save();
  dbStore.addAuditLog(req.user!.userId, 'CREATE_SUBJECT', 'SUBJECT', subject.id, { courseCode });

  return res.status(201).json(subject);
});

// GET /api/admin/timetable
router.get('/timetable', (_req: Request, res: Response) => {
  return res.json(dbStore.getTimetable());
});

// PUT /api/admin/timetable
router.put('/timetable', (req: Request, res: Response) => {
  const { timetable } = req.body;
  if (!Array.isArray(timetable)) {
    return res.status(400).json({ error: 'Timetable array required.' });
  }

  dbStore.setTimetable(timetable);
  dbStore.addAuditLog(req.user!.userId, 'UPDATE_TIMETABLE', 'TIMETABLE', 'all');
  return res.json({ success: true, timetable });
});

// GET /api/admin/reconciliation
router.get('/reconciliation', (_req: Request, res: Response) => {
  const issues = dbStore.getReconciliationIssues();
  return res.json(issues);
});

// POST /api/admin/reconciliation/resolve
router.post('/reconciliation/resolve', (req: Request, res: Response) => {
  const { id, status, resolutionNote } = req.body;
  if (!id || !status) {
    return res.status(400).json({ error: 'Issue ID and status are required.' });
  }

  const updated = dbStore.resolveReconciliationIssue(id, status, resolutionNote || 'Resolved by Administrator');
  if (!updated) return res.status(404).json({ error: 'Reconciliation record not found.' });

  dbStore.addAuditLog(req.user!.userId, 'RESOLVE_RECONCILIATION', 'DISCREPANCY', id, { status, resolutionNote });
  return res.json({ success: true, issue: updated });
});

// POST /api/admin/import/preview (Excel Upload Preview & Validation)
router.post('/import/preview', upload.single('file'), (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'Spreadsheet file required.' });

    const workbook = xlsx.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows: any[] = xlsx.utils.sheet_to_json(sheet);

    if (rows.length === 0) {
      try { fs.unlinkSync(file.path); } catch (e) {}
      return res.status(400).json({ error: 'The uploaded spreadsheet contains no data rows.' });
    }

    const headers = Object.keys(rows[0]);
    const previewRows = rows.slice(0, 10);
    const totalRecords = rows.length;

    // Detect duplicates
    const usnSet = new Set();
    const duplicateUsns: string[] = [];
    rows.forEach(r => {
      const usn = (r['USN'] || r['usn'] || '').toString().trim().toUpperCase();
      if (usn) {
        if (usnSet.has(usn)) {
          duplicateUsns.push(usn);
        } else {
          usnSet.add(usn);
        }
      }
    });

    try { fs.unlinkSync(file.path); } catch (e) {}

    return res.json({
      fileName: file.originalname,
      totalRecords,
      headers,
      previewRows,
      validation: {
        hasUsnColumn: headers.some(h => h.toLowerCase().includes('usn')),
        hasNameColumn: headers.some(h => h.toLowerCase().includes('name')),
        duplicateCount: duplicateUsns.length,
        duplicateUsns
      }
    });
  } catch (err: any) {
    console.error('Import preview error:', err);
    return res.status(500).json({ error: 'Failed to preview uploaded spreadsheet.' });
  }
});

// GET /api/admin/audit-logs
router.get('/audit-logs', (_req: Request, res: Response) => {
  return res.json(dbStore.getAuditLogs(100));
});

export default router;
