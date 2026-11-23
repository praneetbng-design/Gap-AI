import { Router, Request, Response } from 'express';
import { dbStore } from '../database/store.js';
import { requireAuth } from '../middleware/auth.js';
import { aiService } from '../services/aiService.js';

const router = Router();
router.use(requireAuth);

// POST /api/tutor/chat
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { query, subjectId } = req.body;
    if (!query || !query.trim()) {
      return res.status(400).json({ error: 'Question / message cannot be empty.' });
    }

    const student = req.user?.studentId ? dbStore.getStudentById(req.user.studentId) : null;
    const studentName = student ? student.fullName : req.user?.fullName || 'Student';
    const usn = student ? student.usn : 'USN-AIML-5';

    // Retrieve context: subjects, weak topics, chat history
    const subjects = dbStore.listSubjects().map(s => `${s.subjectName} (${s.courseCode})`);
    const topicPerformance = student ? dbStore.getStudentTopicPerformance(student.id) : [];
    const weakTopics = topicPerformance.filter(t => t.status === 'Needs Improvement').map(t => `${t.topicName} in ${t.courseCode}`);

    const targetSubject = subjectId ? dbStore.getSubjectById(subjectId)?.subjectName : undefined;

    // Fetch prior messages
    const prior = student ? dbStore.getAiHistory(student.id, subjectId) : [];
    const chatHistory = prior.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));

    // Record user message
    if (student) {
      dbStore.saveAiMessage(student.id, subjectId, 'user', query.trim());
    }

    // Call AI Tutor service
    const reply = await aiService.getTutorResponse(studentName, usn, query.trim(), {
      enrolledSubjects: subjects,
      weakTopics,
      currentSubject: targetSubject,
      chatHistory
    });

    // Save assistant message
    if (student) {
      dbStore.saveAiMessage(student.id, subjectId, 'assistant', reply);
    }

    return res.json({
      role: 'assistant',
      content: reply,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error('Tutor error:', err);
    return res.status(500).json({ error: 'Failed to generate AI tutor response.' });
  }
});

// GET /api/tutor/history
router.get('/history', (req: Request, res: Response) => {
  const studentId = req.user?.studentId;
  const { subjectId } = req.query;
  if (!studentId) return res.json([]);

  const history = dbStore.getAiHistory(studentId, subjectId ? String(subjectId) : undefined);
  return res.json(history);
});

export default router;
