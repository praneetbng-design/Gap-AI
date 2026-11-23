import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/auth/Login';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ChangePasswordModal } from './components/ChangePasswordModal';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentSubjects } from './pages/student/StudentSubjects';
import { StudentTimetable } from './pages/student/StudentTimetable';
import { StudentProgress } from './pages/student/StudentProgress';
import { StudentTasks } from './pages/student/StudentTasks';
import { StudentTutor } from './pages/student/StudentTutor';
import { StudentAutomata } from './pages/student/StudentAutomata';
import { StudentLeaderboard } from './pages/student/StudentLeaderboard';
import { StudentAchievements } from './pages/student/StudentAchievements';
import { StudentProfile } from './pages/student/StudentProfile';

// Teacher Pages
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { TeacherMarksEntry } from './pages/teacher/TeacherMarksEntry';
import { TeacherAssessments } from './pages/teacher/TeacherAssessments';
import { TeacherMaterials } from './pages/teacher/TeacherMaterials';
import { TeacherAnalytics } from './pages/teacher/TeacherAnalytics';
import { TeacherTimetable } from './pages/teacher/TeacherTimetable';

// Mentor Pages
import { MentorDashboard } from './pages/mentor/MentorDashboard';
import { MentorStudents } from './pages/mentor/MentorStudents';
import { MentorStudentDetail } from './pages/mentor/MentorStudentDetail';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminStudents } from './pages/admin/AdminStudents';
import { AdminSubjects } from './pages/admin/AdminSubjects';
import { AdminReconciliation } from './pages/admin/AdminReconciliation';
import { AdminAuditLogs } from './pages/admin/AdminAuditLogs';

const MainLayout: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-400">Initializing Gap AI Platform...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const handleTabChange = (tab: string, studentId?: string) => {
    setCurrentTab(tab);
    if (studentId) {
      setSelectedStudentId(studentId);
    } else if (tab !== 'students') {
      setSelectedStudentId(null);
    }
  };

  const getPageTitle = () => {
    switch (currentTab) {
      case 'dashboard': return 'Dashboard Overview';
      case 'subjects': return 'Academic Subjects & Topics';
      case 'timetable': return 'Academic Class Schedule';
      case 'progress': return 'Personal Growth Tracker';
      case 'tasks': return 'Daily Personalized AI Tasks';
      case 'tutor': return 'AI Academic Tutor';
      case 'automata': return 'AutomataVerse Simulator Lab';
      case 'leaderboard': return 'Performance Leaderboard';
      case 'achievements': return 'Achievements & Badges';
      case 'profile': return 'My Profile & Security';
      case 'students': return selectedStudentId ? 'Mentee Diagnostic Profile' : 'Student Management';
      case 'marks': return 'Assessment Marks Entry';
      case 'assessments': return 'Assessments & OCR Answer Sheets';
      case 'materials': return 'Learning Materials';
      case 'analytics': return 'Performance Analytics';
      case 'interventions': return 'Academic Intervention Tracker';
      case 'notes': return 'Mentor Notes';
      case 'reconciliation': return 'Data Reconciliation & Imports';
      case 'audit': return 'System Audit Logs';
      default: return 'Gap AI';
    }
  };

  const renderContent = () => {
    // 1. Student Portal
    if (user.role === 'student') {
      switch (currentTab) {
        case 'dashboard': return <StudentDashboard onNavigate={handleTabChange} />;
        case 'subjects': return <StudentSubjects />;
        case 'timetable': return <StudentTimetable />;
        case 'progress': return <StudentProgress />;
        case 'tasks': return <StudentTasks />;
        case 'tutor': return <StudentTutor />;
        case 'automata': return <StudentAutomata />;
        case 'leaderboard': return <StudentLeaderboard />;
        case 'achievements': return <StudentAchievements />;
        case 'profile': return <StudentProfile />;
        default: return <StudentDashboard onNavigate={handleTabChange} />;
      }
    }

    // 2. Teacher Portal
    if (user.role === 'teacher') {
      switch (currentTab) {
        case 'dashboard': return <TeacherDashboard onNavigate={handleTabChange} />;
        case 'subjects': return <StudentSubjects />;
        case 'students': return <AdminStudents />;
        case 'marks': return <TeacherMarksEntry />;
        case 'assessments': return <TeacherAssessments />;
        case 'materials': return <TeacherMaterials />;
        case 'analytics': return <TeacherAnalytics />;
        case 'timetable': return <TeacherTimetable />;
        default: return <TeacherDashboard onNavigate={handleTabChange} />;
      }
    }

    // 3. Mentor Portal
    if (user.role === 'mentor') {
      if (currentTab === 'students' && selectedStudentId) {
        return (
          <MentorStudentDetail
            studentId={selectedStudentId}
            onBack={() => setSelectedStudentId(null)}
          />
        );
      }

      switch (currentTab) {
        case 'dashboard': return <MentorDashboard onNavigate={handleTabChange} />;
        case 'students': return <MentorStudents onSelectStudent={(id) => setSelectedStudentId(id)} />;
        case 'interventions':
        case 'notes':
          return <MentorStudents onSelectStudent={(id) => setSelectedStudentId(id)} />;
        case 'timetable': return <StudentTimetable />;
        default: return <MentorDashboard onNavigate={handleTabChange} />;
      }
    }

    // 4. Admin Portal
    if (user.role === 'admin') {
      switch (currentTab) {
        case 'dashboard': return <AdminDashboard onNavigate={handleTabChange} />;
        case 'students': return <AdminStudents />;
        case 'subjects': return <AdminSubjects />;
        case 'timetable': return <StudentTimetable />;
        case 'reconciliation': return <AdminReconciliation />;
        case 'audit': return <AdminAuditLogs />;
        default: return <AdminDashboard onNavigate={handleTabChange} />;
      }
    }

    return <div className="p-8">Portal Not Found</div>;
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar currentTab={currentTab} onSelectTab={(tab) => handleTabChange(tab)} />
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        <Header title={getPageTitle()} />
        <main className="flex-1 pb-16">{renderContent()}</main>
      </div>
      <ChangePasswordModal />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
};

export default App;
