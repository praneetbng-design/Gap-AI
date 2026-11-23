import { Router, Request, Response } from 'express';
import { dbStore } from '../database/store.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { aiService } from '../services/aiService.js';
import { MentorIntervention } from '../types/index.js';
import { randomUUID } from 'crypto';

const router = Router();
router.use(requireAuth);
router.use(requireRole('mentor', 'admin'));

function getMentorFromReq(req: Request) {
  return dbStore.getMentorByUserId(req.user!.userId);
}

// GET /api/mentor/dashboard
router.get('/dashboard', (req: Request, res: Response) => {
  const mentor = getMentorFromReq(req);
  if (!mentor && req.user!.role !== 'admin') {
    return res.status(404).json({ error: 'Mentor profile not found.' });
  }

  // Strict role check: mentor only gets their assigned students!
  const assignedStudents = mentor ? dbStore.getMentorStudents(mentor.id) : dbStore.listStudents();
  const studentIds = assignedStudents.map(s => s.id);

  // Compute stats across assigned students
  const allMarks = dbStore.getRawData().studentMarks.filter(m => studentIds.includes(m.studentId));
  const assessments = dbStore.listAssessments();

  let totalScore = 0;
  let scoreCount = 0;

  const strugglingStudents: any[] = [];
  const improvingStudents: any[] = [];

  assignedStudents.forEach(stud => {
    const sMarks = allMarks.filter(m => m.studentId === stud.id);
    const topics = dbStore.getStudentTopicPerformance(stud.id);
    const weakTopics = topics.filter(t => t.status === 'Needs Improvement');

    let avg = 65;
    if (sMarks.length > 0) {
      const sum = sMarks.reduce((acc, m) => acc + m.marksObtained, 0);
      avg = Math.round(sum / sMarks.length);
      totalScore += avg;
      scoreCount++;
    }

    if (weakTopics.length > 0 || avg < 50) {
      strugglingStudents.push({
        id: stud.id,
        fullName: stud.fullName,
        usn: stud.usn,
        averageMarks: avg,
        weakTopicCount: weakTopics.length,
        weakTopics: weakTopics.map(w => w.topicName),
        currentRank: stud.currentRank
      });
    } else if (avg >= 75) {
      improvingStudents.push({
        id: stud.id,
        fullName: stud.fullName,
        usn: stud.usn,
        averageMarks: avg,
        currentRank: stud.currentRank
      });
    }
  });

  const batchAverage = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 70;
  const interventions = mentor ? dbStore.getInterventions(mentor.id) : [];
  const pendingFollowups = interventions.filter(i => i.status === 'Scheduled');

  return res.json({
    mentor,
    batchName: mentor?.batchName || 'ALL BATCHES',
    totalStudents: assignedStudents.length,
    batchAverage,
    strugglingCount: strugglingStudents.length,
    improvingCount: improvingStudents.length,
    strugglingStudents,
    improvingStudents,
    pendingFollowups
  });
});

// GET /api/mentor/students (ONLY assigned students)
router.get('/students', (req: Request, res: Response) => {
  const mentor = getMentorFromReq(req);
  const students = mentor ? dbStore.getMentorStudents(mentor.id) : dbStore.listStudents();

  // Attach quick summary stats for each student
  const result = students.map(s => {
    const topics = dbStore.getStudentTopicPerformance(s.id);
    const weakCount = topics.filter(t => t.status === 'Needs Improvement').length;
    const tasks = dbStore.getDailyTasksForStudent(s.id);
    const completedTasks = tasks.filter(t => t.status === 'Completed').length;

    return {
      ...s,
      topicsAssessed: topics.length,
      weakTopicsCount: weakCount,
      tasksCompleted: completedTasks,
      tasksPending: tasks.length - completedTasks
    };
  });

  return res.json(result);
});

// GET /api/mentor/students/:id (Detailed student profile)
router.get('/students/:id', (req: Request, res: Response) => {
  const mentor = getMentorFromReq(req);
  const { id } = req.params;

  const student = dbStore.getStudentById(id);
  if (!student) return res.status(404).json({ error: 'Student not found.' });

  // Security enforcement: mentor cannot access student from another mentor's batch
  if (mentor && req.user!.role !== 'admin') {
    const isAssigned = dbStore.getMentorStudents(mentor.id).some(s => s.id === id);
    if (!isAssigned) {
      return res.status(403).json({ error: 'Access denied. You are only authorized to monitor students in your assigned mentor batch.' });
    }
  }

  const marks = dbStore.getStudentMarks(id);
  const topicPerformance = dbStore.getStudentTopicPerformance(id);
  const tasks = dbStore.getDailyTasksForStudent(id);
  const notes = mentor ? dbStore.getMentorNotes(mentor.id, id) : [];
  const interventions = mentor ? dbStore.getInterventions(mentor.id, id) : [];
  const aiReport = aiService.analyzePerformance(student.fullName, student.usn, topicPerformance);

  return res.json({
    student,
    marks,
    topicPerformance,
    tasks,
    notes,
    interventions,
    aiReport
  });
});

// GET /api/mentor/students/:id/notes
router.get('/students/:id/notes', (req: Request, res: Response) => {
  const mentor = getMentorFromReq(req);
  if (!mentor && req.user!.role !== 'admin') return res.status(403).json({ error: 'Mentor account required.' });

  const notes = dbStore.getMentorNotes(mentor?.id || 'admin', req.params.id);
  return res.json(notes);
});

// POST /api/mentor/students/:id/notes
router.post('/students/:id/notes', (req: Request, res: Response) => {
  const mentor = getMentorFromReq(req);
  if (!mentor && req.user!.role !== 'admin') return res.status(403).json({ error: 'Mentor account required.' });

  const { note, isPrivate } = req.body;
  if (!note || !note.trim()) {
    return res.status(400).json({ error: 'Note text cannot be empty.' });
  }

  const created = dbStore.addMentorNote(
    mentor?.id || 'admin',
    req.params.id,
    note.trim(),
    isPrivate !== undefined ? Boolean(isPrivate) : true
  );

  return res.status(201).json(created);
});

// GET /api/mentor/interventions
router.get('/interventions', (req: Request, res: Response) => {
  const mentor = getMentorFromReq(req);
  const list = mentor ? dbStore.getInterventions(mentor.id) : dbStore.getRawData().interventions;
  return res.json(list);
});

// POST /api/mentor/interventions
router.post('/interventions', (req: Request, res: Response) => {
  const mentor = getMentorFromReq(req);
  if (!mentor && req.user!.role !== 'admin') return res.status(403).json({ error: 'Mentor account required.' });

  const { studentId, interventionType, goal, scheduledFollowup, notes, initialScore } = req.body;
  const student = dbStore.getStudentById(studentId);
  if (!student) return res.status(404).json({ error: 'Student not found.' });

  const intervention: MentorIntervention = {
    id: randomUUID(),
    mentorId: mentor ? mentor.id : 'admin',
    studentId,
    studentName: student.fullName,
    usn: student.usn,
    interventionType: interventionType || 'Academic Counseling',
    goal: goal || 'Target improvement on identified weak topics',
    scheduledFollowup: scheduledFollowup || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    status: 'Scheduled',
    initialScore: parseFloat(initialScore || '40'),
    notes: notes || '',
    createdAt: new Date().toISOString()
  };

  dbStore.createIntervention(intervention);
  dbStore.addAuditLog(req.user!.userId, 'CREATE_INTERVENTION', 'INTERVENTION', intervention.id, { studentId });

  return res.status(201).json(intervention);
});

// PUT /api/mentor/interventions/:id
router.put('/interventions/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  const updated = dbStore.updateIntervention(id, updates);
  if (!updated) return res.status(404).json({ error: 'Intervention not found.' });

  return res.json(updated);
});

export default router;
