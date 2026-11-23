import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../services/api';

export interface AuthContextType {
  user: any | null;
  student: any | null;
  teacher: any | null;
  mentor: any | null;
  token: string | null;
  isLoading: boolean;
  login: (portal: string, identifier: string, password: string) => Promise<any>;
  logout: () => void;
  changePassword: (currentPass: string, newPass: string) => Promise<void>;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [student, setStudent] = useState<any | null>(null);
  const [teacher, setTeacher] = useState<any | null>(null);
  const [mentor, setMentor] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('gap_ai_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshMe = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const data = await apiRequest('/auth/me');
      setUser(data.user);
      setStudent(data.student);
      setTeacher(data.teacher);
      setMentor(data.mentor);
    } catch (err: any) {
      console.warn('Failed to verify token:', err);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshMe();
  }, [token]);

  const login = async (portal: string, identifier: string, password: string) => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ portal, identifier, password })
    });

    localStorage.setItem('gap_ai_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setStudent(data.student);
    setTeacher(data.teacher);
    setMentor(data.mentor);

    return data;
  };

  const logout = () => {
    localStorage.removeItem('gap_ai_token');
    setToken(null);
    setUser(null);
    setStudent(null);
    setTeacher(null);
    setMentor(null);
  };

  const changePassword = async (currentPass: string, newPass: string) => {
    await apiRequest('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword: currentPass, newPassword: newPass })
    });
    if (user) {
      setUser({ ...user, mustChangePassword: false });
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      student,
      teacher,
      mentor,
      token,
      isLoading,
      login,
      logout,
      changePassword,
      refreshMe
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
