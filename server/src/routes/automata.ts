import { Router, Request, Response } from 'express';
import { dbStore } from '../database/store.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// GET /api/automata/exercises
router.get('/exercises', (req: Request, res: Response) => {
  const studentId = req.user?.studentId;
  const exercises = dbStore.getAutomataExercises(studentId);
  return res.json(exercises);
});

// POST /api/automata/exercises/:id/submit
router.post('/exercises/:id/submit', (req: Request, res: Response) => {
  const studentId = req.user?.studentId;
  if (!studentId) {
    return res.status(403).json({ error: 'Only registered students can submit lab exercises.' });
  }

  const { id } = req.params;
  const { reflection, answers } = req.body;

  if (!reflection || !reflection.trim()) {
    return res.status(400).json({ error: 'Reflection and analysis summary required.' });
  }

  const submission = dbStore.submitAutomataExercise(id, studentId, reflection.trim(), answers);
  if (!submission) {
    return res.status(404).json({ error: 'Exercise not found.' });
  }

  const updatedStudent = dbStore.getStudentById(studentId);

  return res.json({
    success: true,
    message: `Exercise submitted successfully! +${submission.xpAwarded} XP awarded!`,
    submission,
    student: updatedStudent
  });
});

export default router;
