import { Router, Request, Response } from 'express';
import { dbStore } from '../database/store.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// GET /api/gamification/leaderboard
router.get('/leaderboard', (req: Request, res: Response) => {
  const type = String(req.query.type || 'overall');
  const leaderboard = dbStore.getLeaderboard(type);
  return res.json(leaderboard);
});

// GET /api/gamification/achievements
router.get('/achievements', (req: Request, res: Response) => {
  const studentId = req.user?.studentId || '';
  const achievements = dbStore.getAchievements(studentId);
  return res.json(achievements);
});

// GET /api/gamification/xp-history
router.get('/xp-history', (req: Request, res: Response) => {
  const studentId = req.user?.studentId;
  if (!studentId) return res.json([]);
  const history = dbStore.getRawData().xpTransactions.filter(t => t.studentId === studentId);
  return res.json(history);
});

export default router;
