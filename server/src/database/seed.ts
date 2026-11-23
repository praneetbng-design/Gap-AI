import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { dbStore, FullDatabaseStore } from './store.js';
import { User, Student, Teacher, Mentor, Subject, TimetableDay, DailyTask, LearningMaterial, Achievement, AutomataExercise, Assessment } from '../types/index.js';

const uuidv4 = randomUUID;

function parseCSV(filePath: string): Record<string, string>[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    // Basic CSV line splitter considering quotes
    const regex = /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g;
    const matches: string[] = [];
    let match;
    while ((match = regex.exec(lines[i])) !== null) {
      if (match.index === regex.lastIndex) regex.lastIndex++;
      let val = match[1] || '';
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.substring(1, val.length - 1).replace(/""/g, '"');
      }
      matches.push(val.trim());
      if (matches.length >= headers.length) break;
    }

    if (matches.length === headers.length) {
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => {
        row[h] = matches[idx];
      });
      rows.push(row);
    }
  }

  return rows;
}

export async function runSeed() {
  console.log('--- Starting Gap AI Database Seed ---');

  let rootDataDir = path.resolve(process.cwd(), 'data');
  if (!fs.existsSync(rootDataDir) || !fs.existsSync(path.join(rootDataDir, 'CSE_AIML_Sem5_Teacher_Subject_Codes(1).csv'))) {
    rootDataDir = path.resolve(process.cwd(), '../data');
  }
  const teacherCodesCsv = path.join(rootDataDir, 'CSE_AIML_Sem5_Teacher_Subject_Codes(1).csv');
  const mentorMappingCsv = path.join(rootDataDir, 'Gap_AI_CSE_AIML_Sem5_Mentor_Mapping(2).csv');
  const studentRosterCsv = path.join(rootDataDir, 'Gap_AI_CSE_AIML_5th_Sem_Student_Roster_Updated(2).csv');
  const timetableJson = path.join(rootDataDir, 'timetable_cse_aiml_sem5.json');

  const store: FullDatabaseStore = {
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

  const BCRYPT_ROUNDS = 6;
  const defaultAdminPass = await bcrypt.hash('Admin@2026', BCRYPT_ROUNDS);
  const defaultTeacherPass = await bcrypt.hash('Teacher@2026', BCRYPT_ROUNDS);
  const defaultMentorPass = await bcrypt.hash('Mentor@2026', BCRYPT_ROUNDS);

  // 1. Seed Admin User
  const adminUserId = uuidv4();
  store.users.push({
    id: adminUserId,
    username: 'admin',
    email: 'admin@gapai.dttit.edu',
    passwordHash: defaultAdminPass,
    role: 'admin',
    fullName: 'System Administrator',
    mustChangePassword: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  // 2. Parse and Seed Subjects and Teachers
  console.log('Seeding Teachers and Subjects...');
  const teacherRows = parseCSV(teacherCodesCsv);
  
  const teacherMapByName: Record<string, { id: string; userId: string; fullName: string; email: string }> = {};

  for (const row of teacherRows) {
    const subjectName = row['Subject Name'];
    const courseCode = row['Course Code'];
    const faculty = row['Faculty / Teacher'];

    if (!subjectName || !courseCode || courseCode === 'Not specified') continue;

    const isLab = courseCode.toLowerCase().includes('lab') || subjectName.toLowerCase().includes('lab') || subjectName.toLowerCase().includes('project');
    const subjectId = uuidv4();

    store.subjects.push({
      id: subjectId,
      subjectName,
      courseCode,
      department: 'CSE-AIML',
      semester: 5,
      isLab,
      teacherName: faculty
    });

    if (faculty && faculty !== 'Not specified') {
      if (!teacherMapByName[faculty]) {
        const teacherUserId = uuidv4();
        const teacherId = uuidv4();
        const username = faculty.toLowerCase().replace(/[^a-z0-9]/g, '.').replace(/\.+/g, '.').replace(/^\.|\.$/g, '');
        const email = `${username}@gapai.dttit.edu`;

        store.users.push({
          id: teacherUserId,
          username,
          email,
          passwordHash: defaultTeacherPass,
          role: 'teacher',
          fullName: faculty,
          mustChangePassword: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });

        store.teachers.push({
          id: teacherId,
          userId: teacherUserId,
          fullName: faculty,
          department: 'CSE-AIML',
          email,
          phone: '+91 98450 ' + Math.floor(10000 + Math.random() * 90000)
        });

        teacherMapByName[faculty] = { id: teacherId, userId: teacherUserId, fullName: faculty, email };
      }

      // Teaching Assignment
      store.teachingAssignments.push({
        id: uuidv4(),
        teacherId: teacherMapByName[faculty].id,
        subjectId,
        academicYear: '2026-27',
        semester: 5
      });
    }
  }

  // 3. Seed Mentors from Mentor Mapping
  console.log('Seeding Mentors and Batches...');
  const mentorRows = parseCSV(mentorMappingCsv);
  const mentorMapByName: Record<string, { id: string; userId: string; fullName: string; batch: string }> = {};

  for (const row of mentorRows) {
    const mentorName = row['Mentor Name'];
    const batch = row['Batch'];

    if (mentorName && !mentorMapByName[mentorName]) {
      const mentorUserId = uuidv4();
      const mentorId = uuidv4();
      const cleanUsername = mentorName.toLowerCase().replace(/[^a-z0-9]/g, '.').replace(/\.+/g, '.').replace(/^\.|\.$/g, '');
      const email = `${cleanUsername}.mentor@gapai.dttit.edu`;

      store.users.push({
        id: mentorUserId,
        username: `mentor.${cleanUsername}`,
        email,
        passwordHash: defaultMentorPass,
        role: 'mentor',
        fullName: mentorName,
        mustChangePassword: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      store.mentors.push({
        id: mentorId,
        userId: mentorUserId,
        fullName: mentorName,
        department: 'CSE-AIML',
        email,
        batchName: batch,
        phone: '+91 94480 ' + Math.floor(10000 + Math.random() * 90000)
      });

      mentorMapByName[mentorName] = { id: mentorId, userId: mentorUserId, fullName: mentorName, batch };
    }
  }

  // 4. Parse Student Roster and Mentor Mapping (Reconciliation Check)
  console.log('Processing Students and Reconciliation Analysis...');
  const studentRows = parseCSV(studentRosterCsv);
  const rosterMapByUsn = new Map<string, Record<string, string>>();
  studentRows.forEach(r => rosterMapByUsn.set(r['USN'].trim().toUpperCase(), r));

  const mentorMapByUsn = new Map<string, Record<string, string>>();
  mentorRows.forEach(r => mentorMapByUsn.set(r['USN'].trim().toUpperCase(), r));

  console.log(`Student roster rows: ${studentRows.length}, Mentor mapping rows: ${mentorRows.length}`);

  // Investigate discrepancy:
  for (const [usn, mRow] of mentorMapByUsn.entries()) {
    if (!rosterMapByUsn.has(usn)) {
      console.log(`[DISCREPANCY DETECTED] USN ${usn} (${mRow['Student Name']}) is in Mentor Mapping ${mRow['Batch']} but NOT in Student Roster.`);
      store.reconciliationIssues.push({
        id: uuidv4(),
        type: 'Missing in Roster',
        usn,
        studentName: mRow['Student Name'],
        batch: mRow['Batch'],
        mentorName: mRow['Mentor Name'],
        status: 'Provisional',
        resolutionNote: 'Auto-enrolled with Provisional status. Please verify enrollment with academic section.'
      });
    }
  }

  // 5. Seed Students
  console.log('Seeding Students with USN Temporary Passwords and Force-Change-Password...');
  const allUsnsToSeed = new Set([...rosterMapByUsn.keys(), ...mentorMapByUsn.keys()]);

  for (const usn of allUsnsToSeed) {
    const rRow = rosterMapByUsn.get(usn);
    const mRow = mentorMapByUsn.get(usn);

    const fullName = rRow ? rRow['Student Name'] : (mRow ? mRow['Student Name'] : usn);
    const enrollmentStatus: 'Active' | 'Provisional' = rRow ? 'Active' : 'Provisional';
    const mentorInfo = mRow ? mentorMapByName[mRow['Mentor Name']] : undefined;

    // Student Login requirements:
    // Username: Student's exact name
    // Password: Student's USN (hashed)
    // Must change password on first login: true!
    const studentPassHash = await bcrypt.hash(usn, BCRYPT_ROUNDS);
    const userId = uuidv4();
    const studentId = uuidv4();

    store.users.push({
      id: userId,
      username: fullName,
      email: `${usn.toLowerCase()}@student.dttit.edu`,
      passwordHash: studentPassHash,
      role: 'student',
      fullName,
      mustChangePassword: true, // Specific requirement
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const studentRecord: Student = {
      id: studentId,
      userId,
      usn,
      fullName,
      department: 'CSE-AIML',
      semester: 5,
      academicYear: '2026-27',
      enrollmentStatus,
      mentorId: mentorInfo?.id,
      mentorName: mentorInfo?.fullName,
      mentorBatch: mentorInfo?.batch,
      currentRank: 'Bronze',
      xpPoints: Math.floor(150 + Math.random() * 350),
      streakDays: Math.floor(2 + Math.random() * 6),
      lastActiveDate: new Date().toISOString().split('T')[0]
    };

    store.students.push(studentRecord);

    // Mentor assignment
    if (mentorInfo) {
      store.mentorAssignments.push({
        id: uuidv4(),
        mentorId: mentorInfo.id,
        studentId,
        batchName: mentorInfo.batch,
        assignedDate: '2026-08-01'
      });
    }

    // Initial XP transaction
    store.xpTransactions.push({
      id: uuidv4(),
      studentId,
      amount: studentRecord.xpPoints,
      reason: 'Welcome bonus & profile setup XP',
      createdAt: new Date().toISOString()
    });
  }

  // 6. Timetable
  console.log('Loading Timetable...');
  if (fs.existsSync(timetableJson)) {
    const ttData = JSON.parse(fs.readFileSync(timetableJson, 'utf-8'));
    store.timetable = ttData;
  }

  // 7. Achievements
  console.log('Seeding Achievements...');
  const achievements: Achievement[] = [
    { id: uuidv4(), title: 'First Task Completed', description: 'Completed your first AI-recommended practice task.', badgeIcon: 'Zap', criteriaType: 'first_task', criteriaValue: 1 },
    { id: uuidv4(), title: 'Seven-Day Streak', description: 'Maintained continuous learning consistency for 7 days.', badgeIcon: 'Flame', criteriaType: 'streak_7', criteriaValue: 7 },
    { id: uuidv4(), title: 'Topic Master', description: 'Scored above 80% and mastered an identified weak topic.', badgeIcon: 'Award', criteriaType: 'xp_500', criteriaValue: 500 },
    { id: uuidv4(), title: 'Consistent Learner', description: 'Submitted all daily tasks for three consecutive days.', badgeIcon: 'CheckCircle2', criteriaType: 'streak_3', criteriaValue: 3 },
    { id: uuidv4(), title: 'Fast Improver', description: 'Demonstrated over 25% improvement on re-assessment.', badgeIcon: 'TrendingUp', criteriaType: 'xp_1000', criteriaValue: 1000 },
    { id: uuidv4(), title: 'Assessment Champion', description: 'Secured top score in a unit assessment.', badgeIcon: 'Trophy', criteriaType: 'top_score', criteriaValue: 1 }
  ];
  store.achievements = achievements;

  // 8. AutomataVerse Exercises
  console.log('Seeding AutomataVerse Exercises...');
  store.automataExercises = [
    {
      id: uuidv4(),
      title: 'DFA: Binary Strings with Even Number of 0s',
      description: 'Design and simulate a Deterministic Finite Automaton (DFA) over alphabet {0, 1} that accepts all strings containing an even number of zeros.',
      machineType: 'DFA',
      sharedLink: 'https://www.automataverse.com/simulator',
      embedUrl: 'https://www.automataverse.com/simulator',
      instructions: '1. Open AutomataVerse simulator.\n2. Create 2 states: q0 (Start, Accept) and q1 (Reject).\n3. Transition on 0 flips between q0 and q1; transition on 1 loops.\n4. Test strings: 00, 1010, 000, 111.\n5. Write your reflection below and submit.',
      maxXP: 100
    },
    {
      id: uuidv4(),
      title: 'NFA to DFA: Pattern Matching for (0+1)*01',
      description: 'Construct a Non-deterministic Finite Automaton that recognizes strings ending with 01, then apply subset construction to convert it to a minimal DFA.',
      machineType: 'NFA',
      sharedLink: 'https://www.automataverse.com/simulator',
      embedUrl: 'https://www.automataverse.com/simulator',
      instructions: '1. Model states q0, q1, q2.\n2. Check non-deterministic transitions on symbol 0.\n3. Validate subset states {q0}, {q0,q1}, {q0,q2}.\n4. Submit your transition table summary.',
      maxXP: 120
    },
    {
      id: uuidv4(),
      title: 'Pushdown Automaton (PDA): L = {a^n b^n | n >= 1}',
      description: 'Design a single-state or multi-state PDA using a stack to accept balanced strings of equal numbers of a\'s followed by equal numbers of b\'s.',
      machineType: 'PDA',
      sharedLink: 'https://www.automataverse.com/simulator',
      embedUrl: 'https://www.automataverse.com/simulator',
      instructions: '1. Push symbol \'X\' on reading \'a\'.\n2. Pop symbol \'X\' on reading \'b\'.\n3. Accept by empty stack or final state upon stack bottom marker \'Z0\'.\n4. Submit verification reflection.',
      maxXP: 150
    }
  ];

  // 9. Baseline Assessments and Topic Marks
  console.log('Seeding Baseline Assessments and Topic Performance Data...');
  const seSubject = store.subjects.find(s => s.courseCode === 'BCS501');
  const cnSubject = store.subjects.find(s => s.courseCode === 'BCS502');
  const tocSubject = store.subjects.find(s => s.courseCode === 'BCS503');
  const ivpSubject = store.subjects.find(s => s.courseCode === 'BCI515D');

  const sherylTeacher = store.teachers.find(t => t.fullName.includes('Sheryl'));
  const maliniTeacher = store.teachers.find(t => t.fullName.includes('Malini'));
  const apoorvaTeacher = store.teachers.find(t => t.fullName.includes('Apoorva'));
  const ezhilanTeacher = store.teachers.find(t => t.fullName.includes('Ezhilan'));

  if (seSubject && sherylTeacher) {
    const seAssId = uuidv4();
    const seAss: Assessment = {
      id: seAssId,
      subjectId: seSubject.id,
      teacherId: sherylTeacher.id,
      title: 'Internal Assessment 1 - Software Engineering',
      assessmentType: 'IA1',
      maxMarks: 40,
      assessmentDate: '2026-09-15'
    };
    store.assessments.push(seAss);

    const seTopic1 = { id: uuidv4(), assessmentId: seAssId, topicName: 'Waterfall Model', maxMarks: 10 };
    const seTopic2 = { id: uuidv4(), assessmentId: seAssId, topicName: 'Agile Model', maxMarks: 10 };
    const seTopic3 = { id: uuidv4(), assessmentId: seAssId, topicName: 'Software Testing', maxMarks: 10 };
    const seTopic4 = { id: uuidv4(), assessmentId: seAssId, topicName: 'Requirements Engineering', maxMarks: 10 };
    store.assessmentTopics.push(seTopic1, seTopic2, seTopic3, seTopic4);

    // Seed marks for students
    store.students.forEach((stud, idx) => {
      // Specifically give Allen Melvin A (1GV24C1001) the exact case from the prompt:
      // Waterfall: 3.5 / 10 (35%), Agile: 8.5 / 10 (85%), Testing: 7.2 / 10 (72%)
      let m1 = Math.floor(4 + Math.random() * 6);
      let m2 = Math.floor(5 + Math.random() * 5);
      let m3 = Math.floor(4 + Math.random() * 6);
      let m4 = Math.floor(5 + Math.random() * 5);

      if (stud.usn === '1GV24C1001') {
        m1 = 3.5;
        m2 = 8.5;
        m3 = 7.2;
        m4 = 8.0;
      }

      const total = m1 + m2 + m3 + m4;
      store.studentMarks.push({
        id: uuidv4(),
        assessmentId: seAssId,
        studentId: stud.id,
        marksObtained: total,
        remarks: total >= 30 ? 'Good work' : 'Needs improvement in Waterfall concepts',
        createdAt: new Date().toISOString()
      });

      store.studentTopicMarks.push(
        { id: uuidv4(), assessmentTopicId: seTopic1.id, assessmentId: seAssId, studentId: stud.id, marksObtained: m1, maxMarks: 10, remarks: m1 < 5 ? 'Review SDLC phases' : 'Strong' },
        { id: uuidv4(), assessmentTopicId: seTopic2.id, assessmentId: seAssId, studentId: stud.id, marksObtained: m2, maxMarks: 10, remarks: 'Good grasp' },
        { id: uuidv4(), assessmentTopicId: seTopic3.id, assessmentId: seAssId, studentId: stud.id, marksObtained: m3, maxMarks: 10, remarks: 'Practice test cases' },
        { id: uuidv4(), assessmentTopicId: seTopic4.id, assessmentId: seAssId, studentId: stud.id, marksObtained: m4, maxMarks: 10, remarks: 'Solid understanding' }
      );
    });
  }

  if (cnSubject && maliniTeacher) {
    const cnAssId = uuidv4();
    const cnAss: Assessment = {
      id: cnAssId,
      subjectId: cnSubject.id,
      teacherId: maliniTeacher.id,
      title: 'Internal Assessment 1 - Computer Networks',
      assessmentType: 'IA1',
      maxMarks: 40,
      assessmentDate: '2026-09-18'
    };
    store.assessments.push(cnAss);

    const cnTopic1 = { id: uuidv4(), assessmentId: cnAssId, topicName: 'IP Addressing & Classless Routing', maxMarks: 10 };
    const cnTopic2 = { id: uuidv4(), assessmentId: cnAssId, topicName: 'Subnetting & VLSM', maxMarks: 10 };
    const cnTopic3 = { id: uuidv4(), assessmentId: cnAssId, topicName: 'Network Topologies', maxMarks: 10 };
    const cnTopic4 = { id: uuidv4(), assessmentId: cnAssId, topicName: 'OSI Reference Model', maxMarks: 10 };
    store.assessmentTopics.push(cnTopic1, cnTopic2, cnTopic3, cnTopic4);

    store.students.forEach((stud, idx) => {
      // Specifically give student 1GV24C1002 (Anjana) the prompt case: weak in IP addressing and subnetting, good in topologies
      let m1 = Math.floor(4 + Math.random() * 6);
      let m2 = Math.floor(4 + Math.random() * 6);
      let m3 = Math.floor(6 + Math.random() * 4);
      let m4 = Math.floor(5 + Math.random() * 5);

      if (stud.usn === '1GV24C1002') {
        m1 = 3.5;
        m2 = 4.0;
        m3 = 9.0;
        m4 = 8.5;
      }

      const total = m1 + m2 + m3 + m4;
      store.studentMarks.push({
        id: uuidv4(),
        assessmentId: cnAssId,
        studentId: stud.id,
        marksObtained: total,
        remarks: 'Reviewed',
        createdAt: new Date().toISOString()
      });

      store.studentTopicMarks.push(
        { id: uuidv4(), assessmentTopicId: cnTopic1.id, assessmentId: cnAssId, studentId: stud.id, marksObtained: m1, maxMarks: 10 },
        { id: uuidv4(), assessmentTopicId: cnTopic2.id, assessmentId: cnAssId, studentId: stud.id, marksObtained: m2, maxMarks: 10 },
        { id: uuidv4(), assessmentTopicId: cnTopic3.id, assessmentId: cnAssId, studentId: stud.id, marksObtained: m3, maxMarks: 10 },
        { id: uuidv4(), assessmentTopicId: cnTopic4.id, assessmentId: cnAssId, studentId: stud.id, marksObtained: m4, maxMarks: 10 }
      );
    });
  }

  // 10. Seed Learning Materials
  console.log('Seeding Sample Learning Materials...');
  if (seSubject && sherylTeacher) {
    store.learningMaterials.push({
      id: uuidv4(),
      subjectId: seSubject.id,
      courseCode: seSubject.courseCode,
      subjectName: seSubject.subjectName,
      teacherId: sherylTeacher.id,
      teacherName: sherylTeacher.fullName,
      title: 'Module 1: Software Process Models & SDLC Comparison',
      description: 'Detailed analysis of Waterfall, Spiral, Iterative, and Agile development methodologies.',
      materialType: 'pdf',
      filePath: 'materials/se_unit1_process_models.pdf',
      fileName: 'SE_Unit1_Process_Models.pdf',
      unit: 1,
      createdAt: new Date().toISOString()
    });
    store.learningMaterials.push({
      id: uuidv4(),
      subjectId: seSubject.id,
      courseCode: seSubject.courseCode,
      subjectName: seSubject.subjectName,
      teacherId: sherylTeacher.id,
      teacherName: sherylTeacher.fullName,
      title: 'Agile vs Waterfall Practice Questions & Solutions',
      description: 'VTU previous exam questions with model answers and evaluation rubrics.',
      materialType: 'questions',
      filePath: 'materials/se_agile_vs_waterfall_qa.pdf',
      fileName: 'SE_Agile_vs_Waterfall_QA.pdf',
      unit: 1,
      createdAt: new Date().toISOString()
    });
  }

  if (cnSubject && maliniTeacher) {
    store.learningMaterials.push({
      id: uuidv4(),
      subjectId: cnSubject.id,
      courseCode: cnSubject.courseCode,
      subjectName: cnSubject.subjectName,
      teacherId: maliniTeacher.id,
      teacherName: maliniTeacher.fullName,
      title: 'IP Addressing, Subnet Masks & VLSM Numerical Guide',
      description: 'Step-by-step problem-solving guide for Classless Inter-Domain Routing (CIDR) and subnetting.',
      materialType: 'pdf',
      filePath: 'materials/cn_subnetting_guide.pdf',
      fileName: 'CN_Subnetting_Guide.pdf',
      unit: 2,
      createdAt: new Date().toISOString()
    });
  }

  // 11. Generate Initial Personalized Daily Tasks based on Individual Weaknesses!
  console.log('Generating Initial Personalized Tasks for Students...');
  store.students.forEach(stud => {
    if (stud.usn === '1GV24C1001') {
      // Allen Melvin A is specifically weak in Waterfall Model (35%)
      store.dailyTasks.push(
        {
          id: uuidv4(),
          studentId: stud.id,
          subjectId: seSubject!.id,
          subjectName: 'Software Engineering',
          courseCode: 'BCS501',
          topic: 'Waterfall Model',
          title: 'Revise Waterfall Model Phases & Feasibility Analysis',
          description: 'Review the 5 sequential phases of the classic Waterfall Model and identify 3 key reasons it fails in rapid-change web projects.',
          difficulty: 'Easy',
          estimatedDurationMins: 20,
          xpReward: 60,
          dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          status: 'Pending'
        },
        {
          id: uuidv4(),
          studentId: stud.id,
          subjectId: seSubject!.id,
          subjectName: 'Software Engineering',
          courseCode: 'BCS501',
          topic: 'Waterfall Model',
          title: 'Complete 5 Practice Questions on SDLC Comparison',
          description: 'Solve the assigned numerical and theoretical comparison questions between Waterfall and Agile sprints.',
          difficulty: 'Medium',
          estimatedDurationMins: 25,
          xpReward: 75,
          dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          status: 'Pending'
        }
      );
    } else if (stud.usn === '1GV24C1002') {
      // Anjana is weak in IP addressing and Subnetting
      store.dailyTasks.push(
        {
          id: uuidv4(),
          studentId: stud.id,
          subjectId: cnSubject!.id,
          subjectName: 'Computer Networks',
          courseCode: 'BCS502',
          topic: 'Subnetting & VLSM',
          title: 'Practice Subnet Mask Calculation for /26 and /28 CIDR',
          description: 'Calculate network address, broadcast address, and assignable host range for 192.168.10.0/26.',
          difficulty: 'Medium',
          estimatedDurationMins: 30,
          xpReward: 80,
          dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          status: 'Pending'
        }
      );
    } else {
      // Generic personalized task based on random topic
      const randTopic = Math.random() > 0.5 ? 'Software Testing Techniques' : 'IP Addressing Fundamentals';
      const randSubj = Math.random() > 0.5 ? seSubject! : cnSubject!;
      store.dailyTasks.push({
        id: uuidv4(),
        studentId: stud.id,
        subjectId: randSubj.id,
        subjectName: randSubj.subjectName,
        courseCode: randSubj.courseCode,
        topic: randTopic,
        title: `Daily Mastery: ${randTopic}`,
        description: `Complete the review concepts and self-test for ${randTopic}.`,
        difficulty: 'Easy',
        estimatedDurationMins: 20,
        xpReward: 50,
        dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        status: 'Pending'
      });
    }
  });

  // 12. Mentor Notes and Sample Interventions
  console.log('Seeding Initial Mentor Notes & Interventions...');
  const ezhilanMentor = store.mentors.find(m => m.fullName.includes('EZHILAN'));
  const allenStudent = store.students.find(s => s.usn === '1GV24C1001');

  if (ezhilanMentor && allenStudent) {
    store.mentorNotes.push({
      id: uuidv4(),
      mentorId: ezhilanMentor.id,
      studentId: allenStudent.id,
      note: 'Allen demonstrated good analytical engagement during Batch 1 orientation. Needs encouragement on traditional software lifecycle methodologies.',
      isPrivate: true,
      createdAt: '2026-09-20T10:30:00Z'
    });

    store.interventions.push({
      id: uuidv4(),
      mentorId: ezhilanMentor.id,
      studentId: allenStudent.id,
      studentName: allenStudent.fullName,
      usn: allenStudent.usn,
      interventionType: 'Skill Remediation',
      goal: 'Improve Waterfall Model topic score from 35% to above 70% before IA2.',
      scheduledFollowup: '2026-10-05',
      status: 'In Progress',
      initialScore: 35,
      notes: 'Provided targeted notes and scheduled peer revision session.',
      createdAt: '2026-09-22T14:00:00Z'
    });
  }

  // Save the full store
  dbStore.setRawData(store);

  console.log(`--- Seed Completed Successfully! ---`);
  console.log(`Total Users: ${store.users.length}`);
  console.log(`Total Students: ${store.students.length} (${store.students.filter(s => s.enrollmentStatus === 'Active').length} Active, ${store.students.filter(s => s.enrollmentStatus === 'Provisional').length} Provisional)`);
  console.log(`Total Teachers: ${store.teachers.length}`);
  console.log(`Total Mentors: ${store.mentors.length}`);
  console.log(`Total Subjects: ${store.subjects.length}`);
  console.log(`Total Timetable Days: ${store.timetable.length}`);
  console.log(`Reconciliation Discrepancies Flagged: ${store.reconciliationIssues.length}`);
}

// Execute only if called directly
if (process.argv[1] && process.argv[1].replace(/\\/g, '/').includes('seed.ts')) {
  runSeed().catch(err => {
    console.error('Seed script failed:', err);
    process.exit(1);
  });
}
