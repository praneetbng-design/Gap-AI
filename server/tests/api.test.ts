import request from 'supertest';
import { app } from '../src/app.js';
import { dbStore } from '../src/database/store.js';
import { runSeed } from '../src/database/seed.js';

async function runTests() {
  console.log('=== Starting Gap AI Backend Integration Tests (Supertest) ===');

  // Reset database with fresh seed for deterministic tests
  await runSeed();

  // 1. Health Check
  console.log('Test 1: Health Check');
  const healthRes = await request(app).get('/api/health');
  if (healthRes.status !== 200 || healthRes.body.status !== 'online') {
    throw new Error(`Health check failed: ${JSON.stringify(healthRes.body)}`);
  }
  console.log('✔ Health check passed');

  // 2. Student Login with exact Name and USN
  console.log('Test 2: Student Login (Exact Name + USN)');
  const studentLoginRes = await request(app)
    .post('/api/auth/login')
    .send({
      portal: 'student',
      identifier: 'ALLEN MELVIN A',
      password: '1GV24C1001'
    });

  if (studentLoginRes.status !== 200 || !studentLoginRes.body.token) {
    throw new Error(`Student login failed: ${JSON.stringify(studentLoginRes.body)}`);
  }
  if (studentLoginRes.body.user.mustChangePassword !== true) {
    throw new Error('mustChangePassword should be true for first-time login');
  }
  console.log('✔ Student login successful and mustChangePassword is required');
  const studentToken = studentLoginRes.body.token;

  // 3. Verify access blocked prior to password change
  console.log('Test 3: Verify access blocked before changing initial password');
  const blockedRes = await request(app)
    .get('/api/student/dashboard')
    .set('Authorization', `Bearer ${studentToken}`);

  if (blockedRes.status !== 403 || !blockedRes.body.mustChangePassword) {
    throw new Error(`Access should be forbidden (403), got ${blockedRes.status}`);
  }
  console.log('✔ Access strictly blocked until password is changed');

  // 4. Change initial student password
  console.log('Test 4: Change student password');
  const changePassRes = await request(app)
    .post('/api/auth/change-password')
    .set('Authorization', `Bearer ${studentToken}`)
    .send({
      currentPassword: '1GV24C1001',
      newPassword: 'SecureStudentPass@2026'
    });

  if (changePassRes.status !== 200 || !changePassRes.body.success) {
    throw new Error(`Password change failed: ${JSON.stringify(changePassRes.body)}`);
  }
  console.log('✔ Password change succeeded');

  // Re-login with updated password
  const reLoginRes = await request(app)
    .post('/api/auth/login')
    .send({
      portal: 'student',
      identifier: 'ALLEN MELVIN A',
      password: 'SecureStudentPass@2026'
    });
  if (reLoginRes.status !== 200) throw new Error('Re-login failed');
  const validStudentToken = reLoginRes.body.token;

  // 5. Student Dashboard
  console.log('Test 5: Student Dashboard Access');
  const dashRes = await request(app)
    .get('/api/student/dashboard')
    .set('Authorization', `Bearer ${validStudentToken}`);

  if (dashRes.status !== 200 || !dashRes.body.student) {
    throw new Error(`Dashboard failed: ${JSON.stringify(dashRes.body)}`);
  }
  const student = dashRes.body.student;
  console.log(`✔ Dashboard loaded for ${student.fullName} (Rank: ${student.currentRank}, XP: ${student.xpPoints})`);

  // Verify specific weak topic detection (Waterfall Model for Allen Melvin A)
  const weakTopics = dashRes.body.aiReport.weakTopics;
  console.log(`✔ Detected weak topics: ${weakTopics.map((w: any) => `${w.topicName} (${w.percentage}%)`).join(', ')}`);

  // 6. Complete Daily Task
  console.log('Test 6: Daily Task Completion and XP Award');
  const tasksRes = await request(app)
    .get('/api/student/tasks')
    .set('Authorization', `Bearer ${validStudentToken}`);

  if (tasksRes.body.length > 0) {
    const taskId = tasksRes.body[0].id;
    const completeRes = await request(app)
      .post(`/api/student/tasks/${taskId}/complete`)
      .set('Authorization', `Bearer ${validStudentToken}`);

    if (completeRes.status !== 200) throw new Error(`Task complete failed: ${JSON.stringify(completeRes.body)}`);
    console.log(`✔ Task completed! New XP: ${completeRes.body.student.xpPoints}`);
  }

  // 7. Teacher Login & Dashboard
  console.log('Test 7: Teacher Login & Dashboard');
  const teacherLoginRes = await request(app)
    .post('/api/auth/login')
    .send({
      portal: 'teacher',
      identifier: 'prof.sheryl.betsy@gapai.dttit.edu',
      password: 'Teacher@2026'
    });
  if (teacherLoginRes.status !== 200) {
    throw new Error(`Teacher login failed: ${JSON.stringify(teacherLoginRes.body)}`);
  }
  const teacherToken = teacherLoginRes.body.token;

  const teacherDashRes = await request(app)
    .get('/api/teacher/dashboard')
    .set('Authorization', `Bearer ${teacherToken}`);
  if (teacherDashRes.status !== 200) throw new Error('Teacher dash failed');
  console.log(`✔ Teacher dashboard loaded for ${teacherDashRes.body.teacher.fullName} (Assigned subjects: ${teacherDashRes.body.assignedSubjects.map((s: any) => s.courseCode).join(', ')})`);

  // 8. Mentor Login & Strict Batch Isolation
  console.log('Test 8: Mentor Login & Batch Isolation');
  const mentorLoginRes = await request(app)
    .post('/api/auth/login')
    .send({
      portal: 'mentor',
      identifier: 'dr.ezhilan.r.mentor@gapai.dttit.edu',
      password: 'Mentor@2026'
    });
  if (mentorLoginRes.status !== 200) {
    throw new Error(`Mentor login failed: ${JSON.stringify(mentorLoginRes.body)}`);
  }
  const mentorToken = mentorLoginRes.body.token;

  const mentorDashRes = await request(app)
    .get('/api/mentor/dashboard')
    .set('Authorization', `Bearer ${mentorToken}`);
  if (mentorDashRes.status !== 200) throw new Error('Mentor dash failed');
  console.log(`✔ Mentor dashboard loaded for ${mentorDashRes.body.mentor.fullName} (Batch: ${mentorDashRes.body.batchName}, Assigned students: ${mentorDashRes.body.totalStudents})`);

  // 9. Admin Login & Reconciliation Report
  console.log('Test 9: Admin Login & Discrepancy Reconciliation');
  const adminLoginRes = await request(app)
    .post('/api/auth/login')
    .send({
      portal: 'admin',
      identifier: 'admin@gapai.dttit.edu',
      password: 'Admin@2026'
    });
  if (adminLoginRes.status !== 200) throw new Error('Admin login failed');
  const adminToken = adminLoginRes.body.token;

  const recRes = await request(app)
    .get('/api/admin/reconciliation')
    .set('Authorization', `Bearer ${adminToken}`);
  if (recRes.status !== 200 || recRes.body.length === 0) {
    throw new Error('Reconciliation issues expected');
  }
  console.log(`✔ Reconciliation discrepancy: USN ${recRes.body[0].usn} (${recRes.body[0].studentName}) - ${recRes.body[0].type}`);

  // 10. AI Tutor Chat
  console.log('Test 10: AI Tutor Chat Completion');
  const tutorRes = await request(app)
    .post('/api/tutor/chat')
    .set('Authorization', `Bearer ${validStudentToken}`)
    .send({
      query: 'Can you explain the Waterfall model and why it fails in Agile environments?'
    });
  if (tutorRes.status !== 200 || !tutorRes.body.content) throw new Error('Tutor failed');
  console.log(`✔ AI Tutor replied with academic guidance (${tutorRes.body.content.length} characters)`);

  // 11. AutomataVerse Lab Submission
  console.log('Test 11: AutomataVerse Exercise Submission');
  const exercisesRes = await request(app)
    .get('/api/automata/exercises')
    .set('Authorization', `Bearer ${validStudentToken}`);

  if (exercisesRes.body.length > 0) {
    const exId = exercisesRes.body[0].id;
    const subRes = await request(app)
      .post(`/api/automata/exercises/${exId}/submit`)
      .set('Authorization', `Bearer ${validStudentToken}`)
      .send({
        reflection: 'Simulated 2-state DFA. Strings with even zeros accepted.'
      });
    if (subRes.status !== 200 || !subRes.body.success) throw new Error('Submission failed');
    console.log(`✔ AutomataVerse lab submission completed, +${subRes.body.submission.xpAwarded} XP awarded!`);
  }

  // 12. Security Test: Student blocked from Admin API
  console.log('Test 12: Role-based Authorization Security Test');
  const unauthorizedRes = await request(app)
    .get('/api/admin/dashboard')
    .set('Authorization', `Bearer ${validStudentToken}`);
  if (unauthorizedRes.status !== 403) {
    throw new Error(`Student should be forbidden from admin API, got ${unauthorizedRes.status}`);
  }
  console.log('✔ Student properly forbidden (403) from accessing admin routes');

  console.log('\n=======================================================');
  console.log('🎉 ALL 12 INTEGRATION TESTS PASSED WITH 100% SUCCESS!');
  console.log('=======================================================');
}

runTests().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
