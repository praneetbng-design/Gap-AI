import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import {
  User, Student, Teacher, Mentor, Subject, TimetableDay,
  Assessment, AssessmentTopic, StudentTopicMark, DailyTask,
  LearningMaterial, LeaderboardEntry, Achievement, MentorIntervention,
  MentorNote, AutomataExercise, RankTier, PerformanceCategory
} from '../types/index.js';

const uuidv4 = randomUUID;

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'gap_ai_store.json');

export interface FullDatabaseStore {
  users: (User & { passwordHash: string })[];
  students: Student[];
  teachers: Teacher[];
  mentors: Mentor[];
  subjects: Subject[];
  teachingAssignments: { id: string; teacherId: string; subjectId: string; academicYear: string; semester: number }[];
  mentorAssignments: { id: string; mentorId: string; studentId: string; batchName: string; assignedDate: string }[];
  timetable: TimetableDay[];
  assessments: Assessment[];
  assessmentTopics: AssessmentTopic[];
  studentMarks: { id: string; assessmentId: string; studentId: string; marksObtained: number; remarks?: string; createdAt: string }[];
  studentTopicMarks: { id: string; assessmentTopicId: string; assessmentId: string; studentId: string; marksObtained: number; maxMarks: number; remarks?: string }[];
  uploadedDocuments: { id: string; assessmentId: string; studentId?: string; fileName: string; filePath: string; fileType: string; ocrExtractedText?: string; ocrExtractedData?: any; verified: boolean; createdAt: string }[];
  learningMaterials: LearningMaterial[];
  dailyTasks: DailyTask[];
  taskCompletions: { id: string; taskId: string; studentId: string; completedAt: string; score?: number; feedback?: string; xpAwarded: number }[];
  xpTransactions: { id: string; studentId: string; amount: number; reason: string; createdAt: string }[];
  achievements: Achievement[];
  studentAchievements: { id: string; studentId: string; achievementId: string; unlockedAt: string }[];
  mentorNotes: MentorNote[];
  interventions: MentorIntervention[];
  aiMessages: { id: string; studentId: string; subjectId?: string; role: 'user' | 'assistant' | 'system'; content: string; createdAt: string }[];
  automataExercises: AutomataExercise[];
  exerciseSubmissions: { id: string; exerciseId: string; studentId: string; reflection: string; answers?: any; verified: boolean; xpAwarded: number; submittedAt: string }[];
  auditLogs: { id: string; userId?: string; action: string; entityType: string; entityId?: string; details?: any; createdAt: string }[];
  reconciliationIssues: { id: string; type: string; usn: string; studentName: string; batch: string; mentorName: string; status: 'Pending' | 'Resolved' | 'Provisional'; resolutionNote?: string }[];
}

function initialStore(): FullDatabaseStore {
  return {
    users: [],
    students: [],
    teachers: [],
    mentors: [],
    subjects: [],
    teachingAssignments: [],
    mentorAssignments: [],
    timetable: [],
    assessments: [],
    assessmentTopics: [],
    studentMarks: [],
    studentTopicMarks: [],
    uploadedDocuments: [],
    learningMaterials: [],
    dailyTasks: [],
    taskCompletions: [],
    xpTransactions: [],
    achievements: [],
    studentAchievements: [],
    mentorNotes: [],
    interventions: [],
    aiMessages: [],
    automataExercises: [],
    exerciseSubmissions: [],
    auditLogs: [],
    reconciliationIssues: []
  };
}

class StoreManager {
  private data: FullDatabaseStore = initialStore();
  private initialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        this.initialized = true;
      } catch (err) {
        console.error('Error reading JSON store, initializing fresh:', err);
        this.save();
      }
    } else {
      this.save();
    }
  }

  public save() {
    try {
      const tempPath = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('Error saving JSON store:', err);
    }
  }

  public getRawData(): FullDatabaseStore {
    return this.data;
  }

  public setRawData(data: FullDatabaseStore) {
    this.data = data;
    this.save();
  }

  // --- Users ---
  public getUserById(id: string) {
    return this.data.users.find(u => u.id === id);
  }

  public getUserByUsername(username: string) {
    const clean = username.trim().toLowerCase();
    return this.data.users.find(u => u.username.trim().toLowerCase() === clean);
  }

  public getUserByEmail(email: string) {
    const clean = email.trim().toLowerCase();
    return this.data.users.find(u => u.email.trim().toLowerCase() === clean);
  }

  public createUser(user: User & { passwordHash: string }) {
    this.data.users.push(user);
    this.save();
    return user;
  }

  public updateUser(id: string, updates: Partial<User & { passwordHash: string }>) {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      this.data.users[idx] = { ...this.data.users[idx], ...updates, updatedAt: new Date().toISOString() };
      this.save();
      return this.data.users[idx];
    }
    return null;
  }

  public listUsers() {
    return this.data.users.map(({ passwordHash, ...safe }) => safe);
  }

  // --- Students ---
  public listStudents() {
    return this.data.students;
  }

  public getStudentById(id: string) {
    return this.data.students.find(s => s.id === id);
  }

  public getStudentByUserId(userId: string) {
    return this.data.students.find(s => s.userId === userId);
  }

  public getStudentByUsn(usn: string) {
    const clean = usn.trim().toUpperCase();
    return this.data.students.find(s => s.usn.trim().toUpperCase() === clean);
  }

  public updateStudent(id: string, updates: Partial<Student>) {
    const idx = this.data.students.findIndex(s => s.id === id);
    if (idx !== -1) {
      this.data.students[idx] = { ...this.data.students[idx], ...updates };
      this.save();
      return this.data.students[idx];
    }
    return null;
  }

  // --- Teachers ---
  public listTeachers() {
    return this.data.teachers.map(t => ({
      ...t,
      assignedSubjects: this.getTeacherSubjects(t.id)
    }));
  }

  public getTeacherById(id: string) {
    const t = this.data.teachers.find(teacher => teacher.id === id);
    if (!t) return null;
    return { ...t, assignedSubjects: this.getTeacherSubjects(t.id) };
  }

  public getTeacherByUserId(userId: string) {
    const t = this.data.teachers.find(teacher => teacher.userId === userId);
    if (!t) return null;
    return { ...t, assignedSubjects: this.getTeacherSubjects(t.id) };
  }

  public getTeacherSubjects(teacherId: string): Subject[] {
    const subjectIds = this.data.teachingAssignments
      .filter(a => a.teacherId === teacherId)
      .map(a => a.subjectId);
    return this.data.subjects.filter(s => subjectIds.includes(s.id));
  }

  // --- Mentors ---
  public listMentors() {
    return this.data.mentors.map(m => ({
      ...m,
      assignedStudentCount: this.data.mentorAssignments.filter(a => a.mentorId === m.id).length
    }));
  }

  public getMentorById(id: string) {
    const m = this.data.mentors.find(mentor => mentor.id === id);
    if (!m) return null;
    return {
      ...m,
      assignedStudentCount: this.data.mentorAssignments.filter(a => a.mentorId === m.id).length
    };
  }

  public getMentorByUserId(userId: string) {
    const m = this.data.mentors.find(mentor => mentor.userId === userId);
    if (!m) return null;
    return {
      ...m,
      assignedStudentCount: this.data.mentorAssignments.filter(a => a.mentorId === m.id).length
    };
  }

  public getMentorStudents(mentorId: string): Student[] {
    const studentIds = this.data.mentorAssignments
      .filter(a => a.mentorId === mentorId)
      .map(a => a.studentId);
    return this.data.students.filter(s => studentIds.includes(s.id));
  }

  // --- Subjects ---
  public listSubjects() {
    return this.data.subjects;
  }

  public getSubjectById(id: string) {
    return this.data.subjects.find(s => s.id === id);
  }

  public getSubjectByCode(code: string) {
    const clean = code.trim().toUpperCase();
    return this.data.subjects.find(s => s.courseCode.trim().toUpperCase() === clean);
  }

  // --- Timetable ---
  public getTimetable() {
    return this.data.timetable;
  }

  public setTimetable(timetable: TimetableDay[]) {
    this.data.timetable = timetable;
    this.save();
    return this.data.timetable;
  }

  public getTimetableForTeacher(teacherFullName: string) {
    const clean = teacherFullName.trim().toLowerCase();
    return this.data.timetable.map(d => ({
      day: d.day,
      periods: d.periods.filter(p => p.faculty.trim().toLowerCase().includes(clean) || clean.includes(p.faculty.trim().toLowerCase()))
    }));
  }

  // --- Assessments & Marks ---
  public listAssessments(subjectId?: string) {
    let list = this.data.assessments;
    if (subjectId) {
      list = list.filter(a => a.subjectId === subjectId);
    }
    return list.map(a => ({
      ...a,
      topics: this.data.assessmentTopics.filter(t => t.assessmentId === a.id)
    }));
  }

  public getAssessmentById(id: string) {
    const a = this.data.assessments.find(item => item.id === id);
    if (!a) return null;
    return {
      ...a,
      topics: this.data.assessmentTopics.filter(t => t.assessmentId === a.id)
    };
  }

  public createAssessment(assessment: Assessment, topics: { topicName: string; maxMarks: number }[]) {
    this.data.assessments.push(assessment);
    for (const t of topics) {
      const topicObj: AssessmentTopic = {
        id: uuidv4(),
        assessmentId: assessment.id,
        topicName: t.topicName,
        maxMarks: t.maxMarks
      };
      this.data.assessmentTopics.push(topicObj);
    }
    this.save();
    return this.getAssessmentById(assessment.id);
  }

  public deleteAssessment(id: string) {
    this.data.assessments = this.data.assessments.filter(a => a.id !== id);
    this.data.assessmentTopics = this.data.assessmentTopics.filter(t => t.assessmentId !== id);
    this.data.studentMarks = this.data.studentMarks.filter(m => m.assessmentId !== id);
    this.data.studentTopicMarks = this.data.studentTopicMarks.filter(tm => tm.assessmentId !== id);
    this.save();
    return true;
  }

  public saveStudentMarks(assessmentId: string, entries: { studentId: string; marksObtained: number; remarks?: string; topicMarks?: { topicId: string; marksObtained: number }[] }[]) {
    for (const entry of entries) {
      // update or create studentMarks
      const existingIdx = this.data.studentMarks.findIndex(m => m.assessmentId === assessmentId && m.studentId === entry.studentId);
      if (existingIdx !== -1) {
        this.data.studentMarks[existingIdx].marksObtained = entry.marksObtained;
        this.data.studentMarks[existingIdx].remarks = entry.remarks;
      } else {
        this.data.studentMarks.push({
          id: uuidv4(),
          assessmentId,
          studentId: entry.studentId,
          marksObtained: entry.marksObtained,
          remarks: entry.remarks,
          createdAt: new Date().toISOString()
        });
      }

      // save topic marks if provided
      if (entry.topicMarks && entry.topicMarks.length > 0) {
        for (const tm of entry.topicMarks) {
          const topic = this.data.assessmentTopics.find(t => t.id === tm.topicId);
          if (topic) {
            const exTopicIdx = this.data.studentTopicMarks.findIndex(t => t.assessmentTopicId === tm.topicId && t.studentId === entry.studentId);
            if (exTopicIdx !== -1) {
              this.data.studentTopicMarks[exTopicIdx].marksObtained = tm.marksObtained;
            } else {
              this.data.studentTopicMarks.push({
                id: uuidv4(),
                assessmentTopicId: tm.topicId,
                assessmentId,
                studentId: entry.studentId,
                marksObtained: tm.marksObtained,
                maxMarks: topic.maxMarks,
                remarks: entry.remarks
              });
            }
          }
        }
      }
    }
    this.save();
  }

  public getStudentMarks(studentId: string) {
    return this.data.studentMarks
      .filter(m => m.studentId === studentId)
      .map(m => {
        const assessment = this.data.assessments.find(a => a.id === m.assessmentId);
        const subject = assessment ? this.data.subjects.find(s => s.id === assessment.subjectId) : null;
        return {
          ...m,
          assessmentTitle: assessment?.title || 'Assessment',
          assessmentType: assessment?.assessmentType || 'IA1',
          maxMarks: assessment?.maxMarks || 100,
          percentage: assessment && assessment.maxMarks > 0 ? Math.round((m.marksObtained / assessment.maxMarks) * 100) : 0,
          subjectName: subject?.subjectName || '',
          courseCode: subject?.courseCode || ''
        };
      });
  }

  public getStudentTopicPerformance(studentId: string, subjectId?: string): StudentTopicMark[] {
    const results: StudentTopicMark[] = [];
    const studentTopicMarks = this.data.studentTopicMarks.filter(tm => tm.studentId === studentId);

    for (const tm of studentTopicMarks) {
      const topic = this.data.assessmentTopics.find(t => t.id === tm.assessmentTopicId);
      const assessment = this.data.assessments.find(a => a.id === tm.assessmentId);
      if (!assessment) continue;
      if (subjectId && assessment.subjectId !== subjectId) continue;
      const subject = this.data.subjects.find(s => s.id === assessment.subjectId);

      const max = tm.maxMarks || topic?.maxMarks || 10;
      const pct = max > 0 ? Math.round((tm.marksObtained / max) * 100) : 0;
      let status: PerformanceCategory = 'Not yet assessed';
      if (pct >= 80) status = 'Excellent';
      else if (pct >= 65) status = 'Good';
      else if (pct >= 50) status = 'Average';
      else status = 'Needs Improvement';

      results.push({
        id: tm.id,
        assessmentId: tm.assessmentId,
        assessmentTitle: assessment.title,
        subjectId: assessment.subjectId,
        courseCode: subject?.courseCode || '',
        topicName: topic?.topicName || 'General Topic',
        marksObtained: tm.marksObtained,
        maxMarks: max,
        percentage: pct,
        status
      });
    }

    return results;
  }

  // --- Learning Materials ---
  public listMaterials(subjectId?: string) {
    if (subjectId) {
      return this.data.learningMaterials.filter(m => m.subjectId === subjectId);
    }
    return this.data.learningMaterials;
  }

  public createMaterial(material: LearningMaterial) {
    this.data.learningMaterials.push(material);
    this.save();
    return material;
  }

  public deleteMaterial(id: string) {
    this.data.learningMaterials = this.data.learningMaterials.filter(m => m.id !== id);
    this.save();
    return true;
  }

  // --- Daily Tasks ---
  public getDailyTasksForStudent(studentId: string): DailyTask[] {
    return this.data.dailyTasks.filter(t => t.studentId === studentId);
  }

  public createDailyTask(task: DailyTask) {
    this.data.dailyTasks.push(task);
    this.save();
    return task;
  }

  public completeDailyTask(taskId: string, studentId: string) {
    const idx = this.data.dailyTasks.findIndex(t => t.id === taskId && t.studentId === studentId);
    if (idx === -1) return null;

    const task = this.data.dailyTasks[idx];
    if (task.status === 'Completed') return task; // already done

    task.status = 'Completed';
    task.completedAt = new Date().toISOString();

    // record completion
    this.data.taskCompletions.push({
      id: uuidv4(),
      taskId,
      studentId,
      completedAt: task.completedAt,
      xpAwarded: task.xpReward
    });

    // Award XP
    this.addXp(studentId, task.xpReward, `Completed daily task: ${task.title}`);

    this.save();
    return task;
  }

  // --- Gamification ---
  public addXp(studentId: string, amount: number, reason: string) {
    const student = this.data.students.find(s => s.id === studentId);
    if (!student) return;

    student.xpPoints = (student.xpPoints || 0) + amount;
    student.currentRank = this.calculateRank(student.xpPoints);

    this.data.xpTransactions.push({
      id: uuidv4(),
      studentId,
      amount,
      reason,
      createdAt: new Date().toISOString()
    });

    // Check achievement unlock: First Task Completed
    if (amount > 0) {
      this.checkAndUnlockAchievements(studentId);
    }

    this.save();
  }

  public calculateRank(xp: number): RankTier {
    if (xp >= 2500) return 'Diamond';
    if (xp >= 1800) return 'Platinum';
    if (xp >= 1200) return 'Gold';
    if (xp >= 700) return 'Silver';
    if (xp >= 300) return 'Bronze';
    return 'Iron';
  }

  public checkAndUnlockAchievements(studentId: string) {
    const student = this.data.students.find(s => s.id === studentId);
    if (!student) return;

    const completedCount = this.data.dailyTasks.filter(t => t.studentId === studentId && t.status === 'Completed').length;
    const existingUnlocked = this.data.studentAchievements.filter(sa => sa.studentId === studentId).map(sa => sa.achievementId);

    for (const ach of this.data.achievements) {
      if (existingUnlocked.includes(ach.id)) continue;

      let unlock = false;
      if (ach.criteriaType === 'first_task' && completedCount >= 1) unlock = true;
      if (ach.criteriaType === 'streak_7' && student.streakDays >= 7) unlock = true;
      if (ach.criteriaType === 'xp_500' && student.xpPoints >= 500) unlock = true;
      if (ach.criteriaType === 'xp_1000' && student.xpPoints >= 1000) unlock = true;

      if (unlock) {
        this.data.studentAchievements.push({
          id: uuidv4(),
          studentId,
          achievementId: ach.id,
          unlockedAt: new Date().toISOString()
        });
      }
    }
  }

  public getLeaderboard(type: string = 'overall'): LeaderboardEntry[] {
    const students = [...this.data.students];

    // compute stats for each student
    const entries: LeaderboardEntry[] = students.map(s => {
      const completedTasks = this.data.dailyTasks.filter(t => t.studentId === s.id && t.status === 'Completed').length;
      const topicMarks = this.getStudentTopicPerformance(s.id);
      const masteredTopics = topicMarks.filter(tm => tm.status === 'Excellent' || tm.status === 'Good').length;
      const marks = this.data.studentMarks.filter(m => m.studentId === s.id);
      const avgScore = marks.length > 0 ? Math.round(marks.reduce((acc, m) => acc + m.marksObtained, 0) / marks.length) : 60;

      return {
        rank: 0,
        studentId: s.id,
        studentName: s.fullName,
        usn: s.usn,
        xpPoints: s.xpPoints || 0,
        rankTier: s.currentRank || 'Bronze',
        streakDays: s.streakDays || 1,
        completedTasks,
        masteredTopics,
        improvementPercentage: Math.min(100, Math.max(5, Math.round(avgScore * 0.25 + completedTasks * 3)))
      };
    });

    if (type === 'weekly') {
      entries.sort((a, b) => b.completedTasks - a.completedTasks || b.xpPoints - a.xpPoints);
    } else if (type === 'improved') {
      entries.sort((a, b) => b.improvementPercentage - a.improvementPercentage);
    } else if (type === 'consistency') {
      entries.sort((a, b) => b.streakDays - a.streakDays || b.xpPoints - a.xpPoints);
    } else {
      // overall xp
      entries.sort((a, b) => b.xpPoints - a.xpPoints);
    }

    entries.forEach((e, idx) => {
      e.rank = idx + 1;
    });

    return entries;
  }

  public getAchievements(studentId: string) {
    const unlockedIds = this.data.studentAchievements
      .filter(sa => sa.studentId === studentId)
      .reduce((acc, sa) => ({ ...acc, [sa.achievementId]: sa.unlockedAt }), {} as Record<string, string>);

    return this.data.achievements.map(ach => ({
      ...ach,
      unlockedAt: unlockedIds[ach.id] || null
    }));
  }

  // --- Mentor Notes & Interventions ---
  public getMentorNotes(mentorId: string, studentId: string) {
    return this.data.mentorNotes.filter(n => n.mentorId === mentorId && n.studentId === studentId);
  }

  public addMentorNote(mentorId: string, studentId: string, note: string, isPrivate: boolean = true) {
    const obj: MentorNote = {
      id: uuidv4(),
      mentorId,
      studentId,
      note,
      isPrivate,
      createdAt: new Date().toISOString()
    };
    this.data.mentorNotes.push(obj);
    this.save();
    return obj;
  }

  public getInterventions(mentorId: string, studentId?: string) {
    let list = this.data.interventions.filter(i => i.mentorId === mentorId);
    if (studentId) {
      list = list.filter(i => i.studentId === studentId);
    }
    return list;
  }

  public createIntervention(intervention: MentorIntervention) {
    this.data.interventions.push(intervention);
    this.save();
    return intervention;
  }

  public updateIntervention(id: string, updates: Partial<MentorIntervention>) {
    const idx = this.data.interventions.findIndex(i => i.id === id);
    if (idx !== -1) {
      this.data.interventions[idx] = { ...this.data.interventions[idx], ...updates };
      this.save();
      return this.data.interventions[idx];
    }
    return null;
  }

  // --- AutomataVerse ---
  public getAutomataExercises(studentId?: string) {
    const submittedIds = studentId
      ? this.data.exerciseSubmissions.filter(s => s.studentId === studentId).map(s => s.exerciseId)
      : [];
    return this.data.automataExercises.map(e => ({
      ...e,
      completed: submittedIds.includes(e.id)
    }));
  }

  public submitAutomataExercise(exerciseId: string, studentId: string, reflection: string, answers?: any) {
    const exercise = this.data.automataExercises.find(e => e.id === exerciseId);
    if (!exercise) return null;

    const sub = {
      id: uuidv4(),
      exerciseId,
      studentId,
      reflection,
      answers,
      verified: true,
      xpAwarded: exercise.maxXP,
      submittedAt: new Date().toISOString()
    };

    this.data.exerciseSubmissions.push(sub);
    this.addXp(studentId, exercise.maxXP, `AutomataVerse Lab: ${exercise.title}`);
    this.save();
    return sub;
  }

  // --- AI Messages ---
  public getAiHistory(studentId: string, subjectId?: string) {
    return this.data.aiMessages.filter(m => m.studentId === studentId && (!subjectId || m.subjectId === subjectId));
  }

  public saveAiMessage(studentId: string, subjectId: string | undefined, role: 'user' | 'assistant' | 'system', content: string) {
    const msg = {
      id: uuidv4(),
      studentId,
      subjectId,
      role,
      content,
      createdAt: new Date().toISOString()
    };
    this.data.aiMessages.push(msg);
    this.save();
    return msg;
  }

  // --- Uploaded Assessment Documents (Answer sheets / OCR) ---
  public saveUploadedAssessmentDoc(doc: { assessmentId: string; studentId?: string; fileName: string; filePath: string; fileType: string; ocrExtractedText?: string; ocrExtractedData?: any }) {
    const record = {
      id: uuidv4(),
      ...doc,
      verified: false,
      createdAt: new Date().toISOString()
    };
    this.data.uploadedDocuments.push(record);
    this.save();
    return record;
  }

  public getUploadedAssessmentDocs(assessmentId?: string) {
    if (assessmentId) {
      return this.data.uploadedDocuments.filter(d => d.assessmentId === assessmentId);
    }
    return this.data.uploadedDocuments;
  }

  public verifyUploadedDoc(id: string) {
    const doc = this.data.uploadedDocuments.find(d => d.id === id);
    if (doc) {
      doc.verified = true;
      this.save();
      return doc;
    }
    return null;
  }

  // --- Reconciliation & Discrepancies ---
  public getReconciliationIssues() {
    return this.data.reconciliationIssues;
  }

  public addReconciliationIssue(issue: { type: string; usn: string; studentName: string; batch: string; mentorName: string; status: 'Pending' | 'Resolved' | 'Provisional'; resolutionNote?: string }) {
    const obj = { id: uuidv4(), ...issue };
    this.data.reconciliationIssues.push(obj);
    this.save();
    return obj;
  }

  public resolveReconciliationIssue(id: string, status: 'Resolved' | 'Provisional', resolutionNote: string) {
    const issue = this.data.reconciliationIssues.find(i => i.id === id);
    if (issue) {
      issue.status = status;
      issue.resolutionNote = resolutionNote;
      this.save();
      return issue;
    }
    return null;
  }

  // --- Audit Logs ---
  public addAuditLog(userId: string | undefined, action: string, entityType: string, entityId?: string, details?: any) {
    this.data.auditLogs.unshift({
      id: uuidv4(),
      userId,
      action,
      entityType,
      entityId,
      details,
      createdAt: new Date().toISOString()
    });
    // keep last 500
    if (this.data.auditLogs.length > 500) {
      this.data.auditLogs.pop();
    }
    this.save();
  }

  public getAuditLogs(limit: number = 50) {
    return this.data.auditLogs.slice(0, limit);
  }
}

export const dbStore = new StoreManager();
