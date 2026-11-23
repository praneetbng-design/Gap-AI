import { Router, Request, Response } from 'express';
import { dbStore } from '../database/store.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { aiService } from '../services/aiService.js';

const router = Router();
router.use(requireAuth);
router.use(requireRole('student'));

// Helper to get current authenticated student
function getStudentFromReq(req: Request) {
  return dbStore.getStudentByUserId(req.user!.userId);
}

// GET /api/student/dashboard
router.get('/dashboard', (req: Request, res: Response) => {
  const student = getStudentFromReq(req);
  if (!student) return res.status(404).json({ error: 'Student record not found.' });

  const subjects = dbStore.listSubjects();
  const marks = dbStore.getStudentMarks(student.id);
  const topicPerformance = dbStore.getStudentTopicPerformance(student.id);
  const dailyTasks = dbStore.getDailyTasksForStudent(student.id);
  const achievements = dbStore.getAchievements(student.id).filter(a => a.unlockedAt);
  const aiReport = aiService.analyzePerformance(student.fullName, student.usn, topicPerformance);

  // Calculate subject-wise performance
  const subjectSummaries = subjects.map(sub => {
    const subMarks = marks.filter(m => m.courseCode === sub.courseCode);
    const subTopics = topicPerformance.filter(t => t.courseCode === sub.courseCode);

    const totalObtained = subMarks.reduce((acc, m) => acc + m.marksObtained, 0);
    const totalMax = subMarks.reduce((acc, m) => acc + m.maxMarks, 0);
    const percentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;

    const weakTopics = subTopics.filter(t => t.status === 'Needs Improvement');
    const masteredTopics = subTopics.filter(t => t.status === 'Excellent' || t.status === 'Good');

    return {
      subjectId: sub.id,
      subjectName: sub.subjectName,
      courseCode: sub.courseCode,
      marksObtained: totalObtained,
      maxMarks: totalMax,
      percentage: totalMax > 0 ? percentage : null,
      status: totalMax === 0 ? 'Not yet assessed' : (percentage >= 80 ? 'Excellent' : percentage >= 65 ? 'Good' : percentage >= 50 ? 'Average' : 'Needs Improvement'),
      weakTopics: weakTopics.map(w => w.topicName),
      masteredTopics: masteredTopics.map(m => m.topicName)
    };
  });

  // Calculate overall student percentage
  const assessedSubjects = subjectSummaries.filter(s => s.percentage !== null);
  const overallPercentage = assessedSubjects.length > 0
    ? Math.round(assessedSubjects.reduce((acc, s) => acc + (s.percentage || 0), 0) / assessedSubjects.length)
    : 0;

  return res.json({
    student: {
      ...student,
      overallPercentage
    },
    mentor: {
      name: student.mentorName || 'Dr. Ezhilan R',
      batch: student.mentorBatch || 'BATCH 1'
    },
    institution: {
      name: 'Dr. T. Thimmaiah Institute of Technology',
      department: 'Computer Science and Engineering (Artificial Intelligence and Machine Learning)',
      semester: 5,
      academicYear: '2026-27'
    },
    aiReport,
    subjectSummaries,
    dailyTasks,
    recentAchievements: achievements.slice(0, 4),
    stats: {
      totalSubjects: subjects.length,
      topicsMastered: topicPerformance.filter(t => t.status === 'Excellent' || t.status === 'Good').length,
      topicsNeedingImprovement: topicPerformance.filter(t => t.status === 'Needs Improvement').length,
      pendingTasksCount: dailyTasks.filter(t => t.status === 'Pending').length,
      completedTasksCount: dailyTasks.filter(t => t.status === 'Completed').length,
      streakDays: student.streakDays,
      xpPoints: student.xpPoints,
      currentRank: student.currentRank
    }
  });
});

// GET /api/student/subjects
router.get('/subjects', (req: Request, res: Response) => {
  const student = getStudentFromReq(req);
  if (!student) return res.status(404).json({ error: 'Student record not found.' });

  const subjects = dbStore.listSubjects();
  const marks = dbStore.getStudentMarks(student.id);
  const topicPerformance = dbStore.getStudentTopicPerformance(student.id);

  const detailedSubjects = subjects.map(sub => {
    const subMarks = marks.filter(m => m.courseCode === sub.courseCode);
    const topics = topicPerformance.filter(t => t.courseCode === sub.courseCode);

    return {
      ...sub,
      assessments: subMarks,
      topics
    };
  });

  return res.json(detailedSubjects);
});

// GET /api/student/topics
router.get('/topics', (req: Request, res: Response) => {
  const student = getStudentFromReq(req);
  if (!student) return res.status(404).json({ error: 'Student record not found.' });

  const topics = dbStore.getStudentTopicPerformance(student.id);
  return res.json(topics);
});

// GET /api/student/tasks
router.get('/tasks', (req: Request, res: Response) => {
  const student = getStudentFromReq(req);
  if (!student) return res.status(404).json({ error: 'Student record not found.' });

  const tasks = dbStore.getDailyTasksForStudent(student.id);
  return res.json(tasks);
});

// POST /api/student/tasks/:id/complete
router.post('/tasks/:id/complete', (req: Request, res: Response) => {
  const student = getStudentFromReq(req);
  if (!student) return res.status(404).json({ error: 'Student record not found.' });

  const { id } = req.params;
  const completedTask = dbStore.completeDailyTask(id, student.id);
  if (!completedTask) {
    return res.status(404).json({ error: 'Task not found or does not belong to you.' });
  }

  // Fetch updated student stats
  const updatedStudent = dbStore.getStudentById(student.id);

  return res.json({
    success: true,
    message: `Task completed! +${completedTask.xpReward} XP awarded!`,
    task: completedTask,
    student: updatedStudent
  });
});

// GET /api/student/progress
router.get('/progress', (req: Request, res: Response) => {
  const student = getStudentFromReq(req);
  if (!student) return res.status(404).json({ error: 'Student record not found.' });

  const topics = dbStore.getStudentTopicPerformance(student.id);
  const tasks = dbStore.getDailyTasksForStudent(student.id);
  const marks = dbStore.getStudentMarks(student.id);

  // Weekly simulated learning consistency trend
  const weeklyData = [
    { week: 'Week 1', completedTasks: 3, studyHours: 6.5, score: 62 },
    { week: 'Week 2', completedTasks: 4, studyHours: 8.0, score: 68 },
    { week: 'Week 3', completedTasks: 5, studyHours: 9.5, score: 74 },
    { week: 'Week 4', completedTasks: 6, studyHours: 11.0, score: 81 }
  ];

  const mastered = topics.filter(t => t.status === 'Excellent' || t.status === 'Good');
  const needsImprovement = topics.filter(t => t.status === 'Needs Improvement');
  const average = topics.filter(t => t.status === 'Average');

  return res.json({
    student,
    topicBreakdown: {
      total: topics.length,
      mastered: mastered.length,
      average: average.length,
      needsImprovement: needsImprovement.length,
      masteryRate: topics.length > 0 ? Math.round((mastered.length / topics.length) * 100) : 0
    },
    weeklyData,
    topics,
    assessments: marks
  });
});

// GET /api/student/timetable
router.get('/timetable', (_req: Request, res: Response) => {
  const timetable = dbStore.getTimetable();
  return res.json(timetable);
});

// GET /api/student/materials
router.get('/materials', (_req: Request, res: Response) => {
  const materials = dbStore.listMaterials();
  return res.json(materials);
});

export default router;
