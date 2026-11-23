import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  jwtSecret: process.env.JWT_SECRET || 'gap_ai_jwt_secret_dev_key_2026_dttit',
  databaseUrl: process.env.DATABASE_URL || '',
  groqApiKey: process.env.GROQ_API_KEY || '',
  groqModel: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
  institution: {
    name: 'Dr. T. Thimmaiah Institute of Technology',
    department: 'Computer Science and Engineering (Artificial Intelligence and Machine Learning)',
    departmentCode: 'CSE-AIML',
    semester: 5,
    academicYear: '2026-27'
  },
  thresholds: {
    excellent: 80,
    good: 65,
    average: 50,
  }
};
