# Gap AI — Student Growth & Academic Performance Intelligence Platform

**Institution:** Dr. T. Thimmaiah Institute of Technology  
**Department:** Computer Science and Engineering (Artificial Intelligence and Machine Learning) [CSE-AIML]  
**Academic Semester:** 5th Semester  
**Academic Year:** 2026–2027  

---

## 📌 Executive Summary

**Gap AI** connects students, teachers, mentors, and administrators through one unified educational intelligence platform. 

Rather than treating academic progress as a single aggregate number, Gap AI breaks down every assessment into individual curriculum topics (e.g., *Waterfall Model* vs *Agile Model* in Software Engineering; *Subnetting* vs *Network Topologies* in Computer Networks). It mathematically identifies each student's specific conceptual weaknesses and generates daily, personalized learning tasks and AI tutor recommendations.

---

## 🚀 Quick Start Guide (Windows & VS Code)

Gap AI is designed to run seamlessly out of the box on Windows with **zero external database configuration required**, while offering native compatibility for PostgreSQL / Neon via standard environment variables.

### 1. Prerequisites
- **Node.js** v18+ (tested on v24.21.0)
- **pnpm** (or standard npm / yarn)

### 2. Installation
Open PowerShell in the project root directory:

```powershell
# Navigate into the project folder
cd GAP-AI

# Install all dependencies (root, server, and client)
pnpm install
cd server && pnpm install && cd ../client && pnpm install && cd ..
```

*(Note: On Windows PowerShell if script execution is restricted, run with `pnpm.cmd` or `npm install`)*.

### 3. Database Seed & Preloaded Academic Data
Preload all 66 students, 4 mentor cohorts, 10 subjects, faculty assignments, timetable, baseline assessments, and AutomataVerse lab exercises:

```powershell
npm run db:seed
```

### 4. Start Development Server
Launch both the backend API and frontend client concurrently:

```powershell
npm run dev
```

- **Frontend Client (Vite):** [http://localhost:5173](http://localhost:5173)
- **Backend API Server:** [http://localhost:5000](http://localhost:5000)
- **Unified Production Mode:** Run `npm run build && npm start` to serve both API and frontend on [http://localhost:5000](http://localhost:5000).

---

## 🔐 Portals & Evaluation Credentials

Gap AI features **four distinct portals** with backend-enforced role-based access control. Click the quick-fill buttons on the login screen for instant evaluation:

### 1. Student Portal
*In accordance with institutional requirements, student passwords are their initial USN and a mandatory password change is enforced on first login.*

| Username (Student Exact Name) | Initial Password (USN) | Cohort / Notes |
| :--- | :--- | :--- |
| `ALLEN MELVIN A` | `1GV24C1001` | Batch 1 (Dr. Ezhilan R) • Identified weak topic: *Waterfall Model (35%)* |
| `ANJANA HANAMANT PUJERI` | `1GV24C1002` | Batch 1 (Dr. Ezhilan R) • Identified weak topic: *Subnetting (40%)* |
| `CHANDRU RAJ P` | `1GV24C1003` | Batch 1 (Dr. Ezhilan R) • Active Enrollment |
| `LESLE S P` | `1GV24C1018` | Batch 2 (Prof. Inbalatha K) • Provisional Discrepancy Case |

### 2. Subject Teacher Portal
| Faculty Teacher Name | Email Identifier | Password | Assigned Subjects |
| :--- | :--- | :--- | :--- |
| **Prof. Sheryl Betsy** | `prof.sheryl.betsy@gapai.dttit.edu` | `Teacher@2026` | Software Engineering (`BCS501`), Music (`BMUK559`) |
| **Mrs. Malini P** | `mrs.malini.p@gapai.dttit.edu` | `Teacher@2026` | Computer Networks (`BCS502`), Computer Networks Lab (`BCS502_Lab`) |
| **Mrs. Apoorva D** | `mrs.apoorva.d@gapai.dttit.edu` | `Teacher@2026` | Theory of Computation (`BCS503`) |
| **Dr. R. Ezhilan** | `dr.r.ezhilan@gapai.dttit.edu` | `Teacher@2026` | Image and Video Processing (`BCI515D`) |
| **Prof. Mukesh M** | `prof.mukesh.m@gapai.dttit.edu` | `Teacher@2026` | Research Methodology & IP (`BRMK557`), Mini Project (`BCI586`) |
| **Prof. Princy M** | `prof.princy.m@gapai.dttit.edu` | `Teacher@2026` | Environmental Studies & E-Waste Management (`BCS508`) |
| **Prathyusha G** | `prathyusha.g@gapai.dttit.edu` | `Teacher@2026` | Data Visualization Lab (`BAIL504`) |

### 3. Faculty Mentor Portal
*Mentors only access mentees within their assigned mentorship cohort.*

| Mentor Name | Email Identifier | Password | Mentorship Cohort | Mentees |
| :--- | :--- | :--- | :--- | :--- |
| **Dr. Ezhilan R** | `dr.ezhilan.r.mentor@gapai.dttit.edu` | `Mentor@2026` | **Batch 1** | 17 Students (`1GV24C1001` to `1GV24C1017`) |
| **Prof. Inbalatha K** | `prof.inbalatha.k.mentor@gapai.dttit.edu` | `Mentor@2026` | **Batch 2** | 17 Students (`1GV24C1018` to `1GV24C1036`) |
| **Prof. Prathyusha** | `prof.prathyusha.mentor@gapai.dttit.edu` | `Mentor@2026` | **Batch 3** | 16 Students (`1GV24C1037` to `1GV24C1053`) |
| **Prof. Malini** | `prof.malini.mentor@gapai.dttit.edu` | `Mentor@2026` | **Batch 4** | 16 Students (`1GV24C1054` to `1GV23C1059`) |

### 4. Institutional Administrator Portal
| Role | Email Identifier | Password | Responsibilities |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@gapai.dttit.edu` | `Admin@2026` | Academic setup, reconciliation center, audit trail, user passwords |

---

## 📊 Preloaded Academic Data & Discrepancy Investigation

### The 65 vs 66 Student Discrepancy Investigation
During initial data audit between the Student Roster (`Gap_AI_CSE_AIML_5th_Sem_Student_Roster_Updated(2).xlsx`) and the Mentor Mapping (`Gap_AI_CSE_AIML_Sem5_Mentor_Mapping(2).xlsx`):
- **Finding:** The Student Roster contained **65 records**, while the Mentor Mapping contained **66 assignments**.
- **Identified Record:** Student USN `1GV24C1018` (**LESLE S P**) is assigned in **Batch 2** under **Prof. Inbalatha K**, but was missing from the roster spreadsheet.
- **Engine Resolution:** The system did not discard this student silently nor invent fictional data. Instead, it registered student `1GV24C1018` with `Provisional` enrollment status and generated an interactive alert in the **Administrator Reconciliation Center** (`/api/admin/reconciliation`), enabling the administrator to approve full enrollment or flag for verification.

---

## 📅 Official 5th Semester Timetable Matrix

Structured with **4 morning periods**, an institutional **lunch break (12:10 PM – 1:40 PM)**, and **3 afternoon periods**:

| Period | Time | Monday | Tuesday | Wednesday | Thursday | Friday | Saturday |
| :---: | :---: | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | 9:00–10:00 AM | Software Eng (BCS501) | Image & Video Proc (BCI515D) | Computer Networks (BCS502) | Data Viz Lab (BAIL504) | Theory of Computation (BCS503) | Image & Video Proc (BCI515D) |
| **2** | 10:00–11:00 AM | Theory of Computation (BCS503) | CN Lab (BCS502_Lab) | Theory of Computation (BCS503) | Data Viz Lab (BAIL504) | Environmental Studies (BCS508) | Software Eng (BCS501) |
| **3** | 11:10–12:10 PM | Image & Video Proc (BCI515D) | CN Lab (BCS502_Lab) | Environmental Studies (BCS508) | Data Viz Lab (BAIL504) | Computer Networks (BCS502) | Research Method & IP (BRMK557) |
| **4** | 12:10–1:10 PM | Research Method & IP (BRMK557) | CN Lab (BCS502_Lab) | Computer Networks (BCS502) | Research Method & IP (BRMK557) | Software Eng (BCS501) | Theory of Computation (BCS503) |
| **🍴** | **12:10–1:40 PM** | **LUNCH BREAK** | **LUNCH BREAK** | **LUNCH BREAK** | **LUNCH BREAK** | **LUNCH BREAK** | **LUNCH BREAK** |
| **5** | 1:40–2:40 PM | Computer Networks (BCS502) | Computer Networks (BCS502) | Image & Video Proc (BCI515D) | Software Eng (BCS501) | Music (BMUK559) | *No Class* |
| **6** | 2:40–3:40 PM | Theory of Computation (BCS503) | Research Method & IP (BRMK557) | Mini Project (BCI586) | Mini Project (BCI586) | Music (BMUK559) | *No Class* |
| **7** | 3:40–4:40 PM | Image & Video Proc (BCI515D) | Software Eng (BCS501) | Mini Project (BCI586) | Mini Project (BCI586) | Mentoring Session | *No Class* |

---

## 🤖 AI Performance Engine & Groq Integration

### How Individual Weaknesses Are Identified
1. Assessment marks are logged with topic-level granualarity (e.g., Waterfall Model: 3.5/10; Agile Model: 8.5/10).
2. The deterministic analytics engine computes exact topic percentages:
   - **Excellent:** \(\ge 80\%\)
   - **Good:** \(65\% - 79\%\)
   - **Average:** \(50\% - 64\%\)
   - **Needs Improvement:** \(< 50\%\)
3. Personalized daily practice tasks are dynamically constructed targeting those exact topics.
4. **AI Tutor:** Powered by the Groq API (`llama-3.3-70b-versatile`). If an API key is not supplied, the platform falls back to an embedded academic intelligence engine providing accurate VTU curriculum answers without crashing.

---

## 🕹️ AutomataVerse Simulator Integration

Under the **Learning Lab** tab:
1. **Direct Simulator Access:** Launch the full official simulator at `https://www.automataverse.com/simulator` in a dedicated tab.
2. **Interactive Exercises:** Preloaded DFA, NFA, and PDA design problems for *Theory of Computation* (BCS503).
3. **Verified Submission:** Students document their state diagrams, transition functions, and test strings to earn verified XP points towards their rank.

---

## 🛠️ Technology Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts.
- **Backend:** Node.js, Express.js, TypeScript, REST API, Zod, bcryptjs, jsonwebtoken, Multer.
- **Database:** PostgreSQL (with Neon-compatible schema in `schema.sql`) + Embedded zero-config atomic JSON relational repository for instant local execution.
- **AI Engine:** Groq API (`groq-sdk`) with pedagogical fallback.

---

## 🧪 Automated Test Suite

To run the complete integration test suite:

```powershell
npm test
```

Verifies all 12 core acceptance checks:
1. Health check & database connection
2. Student login (Name + USN)
3. Forced password change security enforcement
4. Password update & temporary credential invalidation
5. Topic weakness identification
6. Daily task completion & XP award
7. Teacher login & course restrictions
8. Mentor login & batch isolation
9. Discrepancy reconciliation detection (`1GV24C1018`)
10. AI Tutor response generation
11. AutomataVerse lab submission & XP award
12. Role-based unauthorized access rejection (HTTP 403)
