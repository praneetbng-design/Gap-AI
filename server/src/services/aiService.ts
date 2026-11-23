import Groq from 'groq-sdk';
import { config } from '../config/index.js';
import { StudentTopicMark, PerformanceCategory, DailyTask } from '../types/index.js';
import { randomUUID } from 'crypto';

let groqClient: Groq | null = null;
if (config.groqApiKey) {
  try {
    groqClient = new Groq({ apiKey: config.groqApiKey });
  } catch (err) {
    console.warn('Groq client initialization failed, falling back to deterministic AI:', err);
  }
}

export interface StudentAnalysisReport {
  studentName: string;
  usn: string;
  overallPercentage: number;
  weakTopics: StudentTopicMark[];
  strongTopics: StudentTopicMark[];
  averageTopics: StudentTopicMark[];
  recommendations: string[];
  suggestedActionPlan: string;
}

export class AiService {
  /**
   * Deterministically analyze student topic marks
   */
  public analyzePerformance(
    studentName: string,
    usn: string,
    topicMarks: StudentTopicMark[]
  ): StudentAnalysisReport {
    if (topicMarks.length === 0) {
      return {
        studentName,
        usn,
        overallPercentage: 0,
        weakTopics: [],
        strongTopics: [],
        averageTopics: [],
        recommendations: ['No assessment data available yet. Complete baseline assessments.'],
        suggestedActionPlan: 'Initial diagnostic assessment required.'
      };
    }

    const totalPct = topicMarks.reduce((acc, t) => acc + t.percentage, 0);
    const overallPercentage = Math.round(totalPct / topicMarks.length);

    const weakTopics = topicMarks.filter(t => t.percentage < config.thresholds.average);
    const averageTopics = topicMarks.filter(t => t.percentage >= config.thresholds.average && t.percentage < config.thresholds.good);
    const strongTopics = topicMarks.filter(t => t.percentage >= config.thresholds.good);

    const recommendations: string[] = [];

    if (weakTopics.length > 0) {
      weakTopics.forEach(t => {
        recommendations.push(`Priority revision in ${t.courseCode} on topic "${t.topicName}" (currently at ${t.percentage}%).`);
      });
    } else {
      recommendations.push('Strong foundational grasp across assessed units. Focus on advanced applications and peer mentoring.');
    }

    if (averageTopics.length > 0) {
      averageTopics.forEach(t => {
        recommendations.push(`Reinforce conceptual clarity in ${t.topicName} with numerical practice.`);
      });
    }

    const suggestedActionPlan = weakTopics.length > 0
      ? `Focus daily revision on: ${weakTopics.map(w => w.topicName).join(', ')}. Complete AI-recommended practice exercises and consult mentor.`
      : 'Maintain learning momentum with advanced case studies and mock VTU exams.';

    return {
      studentName,
      usn,
      overallPercentage,
      weakTopics,
      strongTopics,
      averageTopics,
      recommendations,
      suggestedActionPlan
    };
  }

  /**
   * Generate personalized daily tasks targeting weak topics
   */
  public generatePersonalizedTasks(
    studentId: string,
    studentName: string,
    weakTopics: StudentTopicMark[]
  ): DailyTask[] {
    const tasks: DailyTask[] = [];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    if (weakTopics.length === 0) {
      // General advancement task
      tasks.push({
        id: randomUUID(),
        studentId,
        subjectId: 'general',
        subjectName: 'Computer Science & Engineering',
        courseCode: 'CSE-AIML',
        topic: 'Algorithm Optimization & Practice',
        title: 'Review Advanced Problem Solving & Dynamic Programming',
        description: 'Spend 25 minutes reviewing time complexity analysis and state-space transitions.',
        difficulty: 'Medium',
        estimatedDurationMins: 25,
        xpReward: 60,
        dueDate: tomorrow,
        status: 'Pending'
      });
      return tasks;
    }

    // Create 1-2 targeted tasks for the weakest topics
    weakTopics.slice(0, 2).forEach(t => {
      tasks.push({
        id: randomUUID(),
        studentId,
        subjectId: t.subjectId,
        subjectName: t.assessmentTitle.includes('Software') ? 'Software Engineering' : (t.assessmentTitle.includes('Network') ? 'Computer Networks' : 'Core Engineering'),
        courseCode: t.courseCode || 'CORE',
        topic: t.topicName,
        title: `Targeted Revision: ${t.topicName}`,
        description: `Review key concepts, diagram flow, and solve 3 practice questions for ${t.topicName}.`,
        difficulty: t.percentage < 35 ? 'Easy' : 'Medium',
        estimatedDurationMins: 20,
        xpReward: 70,
        dueDate: tomorrow,
        status: 'Pending'
      });
    });

    return tasks;
  }

  /**
   * AI Tutor chat completion (Groq API or graceful deterministic educator fallback)
   */
  public async getTutorResponse(
    studentName: string,
    usn: string,
    query: string,
    context: {
      enrolledSubjects: string[];
      weakTopics: string[];
      currentSubject?: string;
      chatHistory?: { role: 'user' | 'assistant'; content: string }[];
    }
  ): Promise<string> {
    const systemPrompt = `You are "Gap AI Tutor", an intelligent academic mentor and tutor at Dr. T. Thimmaiah Institute of Technology for 5th Semester Computer Science and Engineering (Artificial Intelligence and Machine Learning).
The student you are assisting is ${studentName} (USN: ${usn}).
Enrolled Subjects: ${context.enrolledSubjects.join(', ')}.
Current weak topics identified by diagnostic assessments: ${context.weakTopics.length > 0 ? context.weakTopics.join(', ') : 'None currently flagged as critical'}.
${context.currentSubject ? `Current focused subject: ${context.currentSubject}` : ''}

Your goals:
1. Provide accurate, clear, pedagogical explanations tailored to engineering students.
2. If the student asks about a concept related to their weak topics (e.g. Waterfall Model, Subnetting, DFA, Spatial Filtering), provide gentle encouragement, clear step-by-step breakdowns, and a quick self-check question.
3. Be professional, supportive, and academically rigorous.
4. Keep answers structured with bullet points, brief code/formula blocks if relevant, and clear takeaways.`;

    if (groqClient && config.groqApiKey) {
      try {
        const messages: any[] = [
          { role: 'system', content: systemPrompt },
          ...(context.chatHistory || []).slice(-6).map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: query }
        ];

        const completion = await groqClient.chat.completions.create({
          model: config.groqModel || 'llama-3.3-70b-versatile',
          messages,
          temperature: 0.4,
          max_tokens: 800
        });

        const reply = completion.choices[0]?.message?.content;
        if (reply) return reply;
      } catch (err) {
        console.warn('Groq API error in tutor, falling back to local academic response:', err);
      }
    }

    // High quality deterministic academic responses for curriculum topics
    const qLower = query.toLowerCase();

    if (qLower.includes('waterfall') || (qLower.includes('sdlc') && qLower.includes('model'))) {
      return `### Understanding the Waterfall Model (Software Engineering - BCS501)

Hello ${studentName}! The **Waterfall Model** is a classic linear-sequential Software Development Life Cycle (SDLC) model.

#### 1. Core Sequential Phases
1. **Requirements Analysis & Specification:** Gathering all user requirements upfront (SRS document).
2. **System & Software Design:** Architecture design, ER diagrams, data flow diagrams.
3. **Implementation & Coding:** Translating design into executable modules.
4. **Integration & Testing:** Verifying unit interactions and system conformance.
5. **Deployment:** Installing the software in the client environment.
6. **Maintenance:** Bug fixes and minor enhancements.

#### 2. Key Advantages
- Easy to manage due to the rigidity of the model (each phase has specific deliverables).
- Well-suited for projects where requirements are 100% frozen and unambiguous.

#### 3. Why It Often Fails in Modern Agile Environments
- **No working software** is produced until late in the lifecycle.
- **High risk:** Changes in requirements midway are very costly or impossible to accommodate.
- **Client feedback** only occurs at the very end.

💡 **Self-Check Question for you:** *In which scenario is the Waterfall model preferred over Agile sprints?* (Think about aerospace, nuclear reactors, or regulatory safety devices with fixed specifications!)`;
    }

    if (qLower.includes('subnet') || qLower.includes('ip address') || qLower.includes('vlsm')) {
      return `### Subnetting & IP Addressing Guide (Computer Networks - BCS502)

Hello ${studentName}! Let's break down **IPv4 Subnetting** step-by-step:

#### 1. The Basics
An IPv4 address consists of **32 bits** divided into 4 octets (8 bits each).
- **Network ID:** Identifies the network.
- **Host ID:** Identifies the specific host on that network.

#### 2. Understanding CIDR Notation (e.g. /26)
- \`/26\` means the first 26 bits are dedicated to the network, and \(32 - 26 = 6\) bits remain for hosts.
- **Subnet Mask:** \`11111111.11111111.11111111.11000000\` = \`255.255.255.192\`
- **Number of Subnets:** \(2^{(26 - 24)} = 2^2 = 4\) subnets.
- **Total IPs per Subnet:** \(2^6 = 64\) addresses.
- **Usable Hosts:** \(2^6 - 2 = 62\) (subtracting Network ID and Broadcast ID).

#### 3. Quick Calculation for 192.168.1.0/26:
- Subnet 1: \`192.168.1.0\` to \`192.168.1.63\` (Usable: .1 to .62)
- Subnet 2: \`192.168.1.64\` to \`192.168.1.127\` (Usable: .65 to .126)
- Subnet 3: \`192.168.1.128\` to \`192.168.1.191\` (Usable: .129 to .190)
- Subnet 4: \`192.168.1.192\` to \`192.168.1.255\` (Usable: .193 to .254)

💡 **Tip:** To master subnetting, remember the powers of 2 for host bits: \(2^2=4, 2^3=8, 2^4=16, 2^5=32, 2^6=64, 2^7=128\).`;
    }

    if (qLower.includes('dfa') || qLower.includes('nfa') || qLower.includes('automata')) {
      return `### Finite Automata Overview (Theory of Computation - BCS503)

Hello ${studentName}! In Theory of Computation, a **Deterministic Finite Automaton (DFA)** is defined as a 5-tuple:
\\[ M = (Q, \\Sigma, \\delta, q_0, F) \\]
Where:
- \\(Q\\): Finite set of states.
- \\(\\Sigma\\): Finite alphabet of input symbols (e.g., \\(\\{0, 1\\}\\)).
- \\(\\delta\\): Transition function \\(Q \\times \\Sigma \\rightarrow Q\\) (deterministic: exactly one next state for each symbol).
- \\(q_0\\): Initial start state (\\(q_0 \\in Q\\)).
- \\(F\\): Set of accepting/final states (\\(F \\subseteq Q\\)).

#### Key Differences: DFA vs NFA
| Property | DFA | NFA |
| :--- | :--- | :--- |
| Next state | Unique state for every input symbol | Zero, one, or multiple states |
| \\(\\epsilon\\)-transitions | Not allowed | Allowed (transitions without reading input) |
| Simulation difficulty | Very easy (linear in input length) | Requires backtracking or subset tracking |
| Expressive Power | Recognizes Regular Languages | Identical to DFA (by Subset Construction) |

💡 Check out the **AutomataVerse** tab in your Learning Lab to test DFA transitions interactively!`;
    }

    return `Hello ${studentName}! I am your Gap AI Academic Tutor.

I see you are inquiring about: "${query}".

As a 5th-semester CSE-AIML student at Dr. T. Thimmaiah Institute of Technology, you have courses in:
- **BCS501**: Software Engineering
- **BCS502**: Computer Networks
- **BCS503**: Theory of Computation
- **BCI515D**: Image & Video Processing
- **BRMK557**: Research Methodology & IP

To help you effectively:
1. Would you like a conceptual breakdown with real-world examples?
2. Would you like step-by-step numerical/problem-solving practice?
3. Or would you like a quick 3-question revision quiz?

Feel free to ask specific questions about any topic or upload evaluation queries!`;
  }
}

export const aiService = new AiService();
