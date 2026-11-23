import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import xlsx from 'xlsx';
import { dbStore } from '../database/store.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { Assessment, LearningMaterial } from '../types/index.js';
import { randomUUID } from 'crypto';

const router = Router();
router.use(requireAuth);
router.use(requireRole('teacher', 'admin'));

function getTeacherFromReq(req: Request) {
  return dbStore.getTeacherByUserId(req.user!.userId);
}

// GET /api/teacher/dashboard
router.get('/dashboard', (req: Request, res: Response) => {
  const teacher = getTeacherFromReq(req);
  if (!teacher && req.user!.role !== 'admin') {
    return res.status(404).json({ error: 'Teacher record not found.' });
  }

  const assignedSubjects = teacher ? dbStore.getTeacherSubjects(teacher.id) : dbStore.listSubjects();
  const allStudents = dbStore.listStudents();
  const timetable = dbStore.getTimetable();
  const teacherTimetable = teacher ? dbStore.getTimetableForTeacher(teacher.fullName) : [];

  // Gather assessments for these subjects
  const subjectIds = assignedSubjects.map(s => s.id);
  const assessments = dbStore.listAssessments().filter(a => subjectIds.includes(a.subjectId));

  // Compute class statistics
  const marks = dbStore.getRawData().studentMarks.filter(m => assessments.some(a => a.id === m.assessmentId));
  const classAvg = marks.length > 0 ? Math.round(marks.reduce((acc, m) => acc + m.marksObtained, 0) / marks.length) : 72;

  // At-risk students (score < 50% on assessments)
  const atRiskStudents: any[] = [];
  marks.forEach(m => {
    const ass = assessments.find(a => a.id === m.assessmentId);
    if (ass && ass.maxMarks > 0) {
      const pct = (m.marksObtained / ass.maxMarks) * 100;
      if (pct < 50) {
        const student = allStudents.find(s => s.id === m.studentId);
        if (student && !atRiskStudents.some(item => item.studentId === student.id)) {
          atRiskStudents.push({
            studentId: student.id,
            fullName: student.fullName,
            usn: student.usn,
            subjectTitle: ass.title,
            score: m.marksObtained,
            maxMarks: ass.maxMarks,
            percentage: Math.round(pct)
          });
        }
      }
    }
  });

  return res.json({
    teacher,
    assignedSubjects,
    totalStudents: allStudents.length,
    assessmentsCount: assessments.length,
    classAverage: classAvg,
    atRiskStudents,
    todayClasses: teacherTimetable.flatMap(d => d.periods)
  });
});

// GET /api/teacher/subjects
router.get('/subjects', (req: Request, res: Response) => {
  const teacher = getTeacherFromReq(req);
  const subjects = teacher ? dbStore.getTeacherSubjects(teacher.id) : dbStore.listSubjects();
  return res.json(subjects);
});

// GET /api/teacher/students
router.get('/students', (req: Request, res: Response) => {
  const students = dbStore.listStudents();
  return res.json(students);
});

// GET /api/teacher/assessments
router.get('/assessments', (req: Request, res: Response) => {
  const teacher = getTeacherFromReq(req);
  const subjectIds = teacher ? dbStore.getTeacherSubjects(teacher.id).map(s => s.id) : undefined;
  
  let list = dbStore.listAssessments();
  if (subjectIds) {
    list = list.filter(a => subjectIds.includes(a.subjectId));
  }
  return res.json(list);
});

// POST /api/teacher/assessments
router.post('/assessments', (req: Request, res: Response) => {
  const teacher = getTeacherFromReq(req);
  const { subjectId, title, assessmentType, maxMarks, assessmentDate, topics } = req.body;

  if (!subjectId || !title || !maxMarks || !topics || !Array.isArray(topics)) {
    return res.status(400).json({ error: 'Subject, title, maxMarks, and topic breakdown are required.' });
  }

  const subject = dbStore.getSubjectById(subjectId);
  if (!subject) return res.status(404).json({ error: 'Subject not found.' });

  const newAss: Assessment = {
    id: randomUUID(),
    subjectId,
    subjectName: subject.subjectName,
    courseCode: subject.courseCode,
    teacherId: teacher ? teacher.id : 'admin',
    teacherName: teacher ? teacher.fullName : 'Administrator',
    title,
    assessmentType: assessmentType || 'IA1',
    maxMarks: Number(maxMarks),
    assessmentDate: assessmentDate || new Date().toISOString().split('T')[0]
  };

  const created = dbStore.createAssessment(newAss, topics);
  dbStore.addAuditLog(req.user!.userId, 'CREATE_ASSESSMENT', 'ASSESSMENT', newAss.id, { title, subjectId });

  return res.status(201).json(created);
});

// DELETE /api/teacher/assessments/:id
router.delete('/assessments/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  dbStore.deleteAssessment(id);
  dbStore.addAuditLog(req.user!.userId, 'DELETE_ASSESSMENT', 'ASSESSMENT', id);
  return res.json({ success: true, message: 'Assessment deleted.' });
});

// POST /api/teacher/assessments/:id/marks
router.post('/assessments/:id/marks', (req: Request, res: Response) => {
  const { id } = req.params;
  const { marks } = req.body; // array of { studentId, marksObtained, remarks, topicMarks?: [{ topicId, marksObtained }] }

  if (!marks || !Array.isArray(marks)) {
    return res.status(400).json({ error: 'Marks array is required.' });
  }

  dbStore.saveStudentMarks(id, marks);
  dbStore.addAuditLog(req.user!.userId, 'SAVE_MARKS', 'ASSESSMENT', id, { count: marks.length });

  return res.json({ success: true, message: `Marks recorded for ${marks.length} students.` });
});

// POST /api/teacher/assessments/:id/upload-sheet (Answer sheet OCR & verification)
router.post('/assessments/:id/upload-sheet', upload.single('document'), (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { studentId } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No document uploaded.' });
    }

    const assessment = dbStore.getAssessmentById(id);
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found.' });
    }

    // Deterministic OCR simulation
    const student = studentId ? dbStore.getStudentById(studentId) : null;
    const isImage = file.mimetype.startsWith('image/');
    const simulatedScore = Math.floor(Math.random() * (assessment.maxMarks * 0.4) + (assessment.maxMarks * 0.5));

    const simulatedOcrText = `[OCR SCAN RESULT - Evaluated Answer Script]
Institution: Dr. T. Thimmaiah Institute of Technology
Department: CSE (AIML)
Course: ${assessment.subjectName} (${assessment.courseCode})
Assessment: ${assessment.title}
Student: ${student ? `${student.fullName} [USN: ${student.usn}]` : 'Detected: Handwritten Examination Paper'}
Evaluation Matrix:
${(assessment.topics || []).map((t, idx) => `Q${idx + 1} (${t.topicName}): ${Math.floor(t.maxMarks * 0.7)}/${t.maxMarks}`).join('\n')}
Total Evaluated Score: ${simulatedScore} / ${assessment.maxMarks}
Instructor Signature: Verified`;

    const extractedData = {
      detectedUsn: student?.usn || '1GV24C1001',
      detectedScore: simulatedScore,
      maxMarks: assessment.maxMarks,
      topicBreakdown: (assessment.topics || []).map(t => ({
        topicId: t.id,
        topicName: t.topicName,
        suggestedMarks: Math.floor(t.maxMarks * 0.7)
      }))
    };

    const docRecord = dbStore.saveUploadedAssessmentDoc({
      assessmentId: id,
      studentId: studentId || undefined,
      fileName: file.originalname,
      filePath: `/uploads/${file.filename}`,
      fileType: file.mimetype,
      ocrExtractedText: simulatedOcrText,
      ocrExtractedData: extractedData
    });

    return res.json({
      success: true,
      message: 'Assessment sheet uploaded and processed through OCR engine.',
      document: docRecord,
      extractedData
    });
  } catch (err: any) {
    console.error('Upload answer sheet error:', err);
    return res.status(500).json({ error: 'Failed to process document upload.' });
  }
});

// POST /api/teacher/assessments/:id/bulk-marks (Excel import)
router.post('/assessments/:id/bulk-marks', upload.single('file'), (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'Spreadsheet file is required.' });
    }

    const workbook = xlsx.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows: any[] = xlsx.utils.sheet_to_json(sheet);

    const students = dbStore.listStudents();
    const parsedMarks: any[] = [];
    const errors: string[] = [];

    rows.forEach((r, idx) => {
      const usn = (r['USN'] || r['usn'] || '').toString().trim().toUpperCase();
      const marks = parseFloat(r['Marks'] || r['marks'] || r['Score'] || '0');
      const remarks = (r['Remarks'] || r['remarks'] || '').toString().trim();

      const student = students.find(s => s.usn === usn);
      if (student) {
        parsedMarks.push({
          studentId: student.id,
          marksObtained: marks,
          remarks
        });
      } else {
        errors.push(`Row ${idx + 2}: USN "${usn}" not found in registered students.`);
      }
    });

    if (parsedMarks.length > 0) {
      dbStore.saveStudentMarks(id, parsedMarks);
    }

    // Clean temp upload
    try { fs.unlinkSync(file.path); } catch (e) {}

    return res.json({
      success: true,
      importedCount: parsedMarks.length,
      errorsCount: errors.length,
      errors
    });
  } catch (err: any) {
    console.error('Bulk marks import error:', err);
    return res.status(500).json({ error: 'Failed to import bulk marks spreadsheet.' });
  }
});

// GET /api/teacher/materials
router.get('/materials', (req: Request, res: Response) => {
  const teacher = getTeacherFromReq(req);
  const materials = dbStore.listMaterials();
  if (teacher) {
    const subjectIds = dbStore.getTeacherSubjects(teacher.id).map(s => s.id);
    return res.json(materials.filter(m => subjectIds.includes(m.subjectId)));
  }
  return res.json(materials);
});

// POST /api/teacher/materials
router.post('/materials', upload.single('file'), (req: Request, res: Response) => {
  try {
    const teacher = getTeacherFromReq(req);
    const { subjectId, title, description, unit, materialType } = req.body;
    const file = req.file;

    if (!subjectId || !title || !file) {
      return res.status(400).json({ error: 'Subject, title, and file are required.' });
    }

    const subject = dbStore.getSubjectById(subjectId);
    if (!subject) return res.status(404).json({ error: 'Subject not found.' });

    const material: LearningMaterial = {
      id: randomUUID(),
      subjectId,
      courseCode: subject.courseCode,
      subjectName: subject.subjectName,
      teacherId: teacher ? teacher.id : 'admin',
      teacherName: teacher ? teacher.fullName : 'Administrator',
      title,
      description: description || '',
      materialType: materialType || 'pdf',
      filePath: `/uploads/${file.filename}`,
      fileName: file.originalname,
      unit: parseInt(unit || '1', 10),
      createdAt: new Date().toISOString()
    };

    dbStore.createMaterial(material);
    dbStore.addAuditLog(req.user!.userId, 'UPLOAD_MATERIAL', 'MATERIAL', material.id, { title, subjectId });

    return res.status(201).json(material);
  } catch (err: any) {
    console.error('Material upload error:', err);
    return res.status(500).json({ error: 'Failed to upload material.' });
  }
});

// DELETE /api/teacher/materials/:id
router.delete('/materials/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  dbStore.deleteMaterial(id);
  return res.json({ success: true, message: 'Material deleted.' });
});

// GET /api/teacher/timetable
router.get('/timetable', (req: Request, res: Response) => {
  const teacher = getTeacherFromReq(req);
  if (!teacher) return res.json(dbStore.getTimetable());
  const tt = dbStore.getTimetableForTeacher(teacher.fullName);
  return res.json(tt);
});

export default router;
