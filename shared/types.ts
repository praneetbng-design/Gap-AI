export type UserRole = 'student' | 'teacher' | 'mentor' | 'admin';

export type PerformanceCategory = 'Excellent' | 'Good' | 'Average' | 'Needs Improvement' | 'Not yet assessed';

export type RankTier = 'Iron' | 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  fullName: string;
  mustChangePassword: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: string;
  userId: string;
  usn: string;
  fullName: string;
  department: string;
  semester: number;
  academicYear: string;
  enrollmentStatus: 'Active' | 'Provisional' | 'Inactive';
  mentorId?: string;
  mentorName?: string;
  mentorBatch?: string;
  currentRank: RankTier;
  xpPoints: number;
  streakDays: number;
  lastActiveDate: string;
  overallPercentage?: number;
}

export interface Teacher {
  id: string;
  userId: string;
  fullName: string;
  department: string;
  email: string;
  phone?: string;
  assignedSubjects?: Subject[];
}

export interface Mentor {
  id: string;
  userId: string;
  fullName: string;
  department: string;
  email: string;
  phone?: string;
  batchName: string;
  assignedStudentCount?: number;
}

export interface Subject {
  id: string;
  subjectName: string;
  courseCode: string;
  department: string;
  semester: number;
  isLab: boolean;
  teacherName?: string;
  teacherId?: string;
}

export interface TimetablePeriod {
  period: number;
  time: string;
  subject: string;
  code: string;
  faculty: string;
  room: string;
}

export interface TimetableDay {
  day: string;
  periods: TimetablePeriod[];
}

export interface AssessmentTopic {
  id: string;
  assessmentId: string;
  topicName: string;
  maxMarks: number;
}

export interface Assessment {
  id: string;
  subjectId: string;
  subjectName?: string;
  courseCode?: string;
  teacherId: string;
  teacherName?: string;
  title: string;
  assessmentType: 'IA1' | 'IA2' | 'Lab' | 'Assignment' | 'Quiz';
  maxMarks: number;
  assessmentDate: string;
  documentUrl?: string;
  topics?: AssessmentTopic[];
}

export interface StudentTopicMark {
  id: string;
  assessmentId: string;
  assessmentTitle: string;
  subjectId: string;
  courseCode: string;
  topicName: string;
  marksObtained: number;
  maxMarks: number;
  percentage: number;
  status: PerformanceCategory;
}

export interface DailyTask {
  id: string;
  studentId: string;
  subjectId: string;
  subjectName: string;
  courseCode: string;
  topic: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedDurationMins: number;
  xpReward: number;
  dueDate: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  completedAt?: string;
}

export interface LearningMaterial {
  id: string;
  subjectId: string;
  courseCode: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  title: string;
  description: string;
  materialType: 'pdf' | 'ppt' | 'docx' | 'notes' | 'questions';
  filePath: string;
  fileName: string;
  unit: number;
  createdAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  studentId: string;
  studentName: string;
  usn: string;
  xpPoints: number;
  rankTier: RankTier;
  streakDays: number;
  completedTasks: number;
  masteredTopics: number;
  improvementPercentage: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  badgeIcon: string;
  criteriaType: string;
  criteriaValue: number;
  unlockedAt?: string;
}

export interface MentorIntervention {
  id: string;
  mentorId: string;
  studentId: string;
  studentName: string;
  usn: string;
  interventionType: 'Academic Counseling' | 'Attendance' | 'Personal Guidance' | 'Skill Remediation';
  goal: string;
  scheduledFollowup: string;
  status: 'Scheduled' | 'In Progress' | 'Completed';
  initialScore: number;
  postInterventionScore?: number;
  notes: string;
  createdAt: string;
}

export interface MentorNote {
  id: string;
  mentorId: string;
  studentId: string;
  note: string;
  isPrivate: boolean;
  createdAt: string;
}

export interface AutomataExercise {
  id: string;
  title: string;
  description: string;
  machineType: 'DFA' | 'NFA' | 'PDA' | 'Turing Machine';
  sharedLink: string;
  embedUrl: string;
  instructions: string;
  maxXP: number;
  completed?: boolean;
}
