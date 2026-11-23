import React, { useEffect, useState, useRef } from 'react';
import { apiRequest } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Bot, Send, Sparkles, User, BookOpen, AlertCircle, RefreshCw } from 'lucide-react';

export const StudentTutor: React.FC = () => {
  const { student } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchHistory = async () => {
    try {
      const history = await apiRequest('/tutor/history');
      if (history.length > 0) {
        setMessages(history);
      } else {
        // Welcome message
        setMessages([
          {
            role: 'assistant',
            content: `Hello ${student?.fullName || 'Student'}! I am your **Gap AI Academic Tutor** for 5th Semester CSE-AIML at Dr. T. Thimmaiah Institute of Technology.

I have direct visibility into your enrolled courses and recent diagnostic assessments. 

Feel free to ask me to explain difficult topics (like the **Waterfall Model**, **Subnetting & CIDR**, **Finite Automata**, or **Spatial Convolution**), request practice questions, or prepare a step-by-step revision guide!`,
            createdAt: new Date().toISOString()
          }
        ]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const q = textToSend || inputQuery;
    if (!q.trim() || loading) return;

    const userMsg = { role: 'user', content: q.trim(), createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await apiRequest('/tutor/chat', {
        method: 'POST',
        body: JSON.stringify({ query: q.trim() })
      });
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: res.content, createdAt: res.timestamp }
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I apologize, but I encountered a momentary connection issue. Please verify your query or retry.',
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    'Explain why Waterfall model fails in rapid Agile web development',
    'How do I calculate the subnet mask and host range for 192.168.1.0/26?',
    'What is the difference between a DFA and an NFA in Theory of Computation?',
    'Give me 3 practice questions on spatial filtering in Image Processing'
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto flex flex-col h-[calc(100vh-5rem)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white rounded-xl shadow-md shadow-indigo-600/20">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
              <span>Gap AI Academic Tutor</span>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                Groq Intelligence
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Personalized concept explanations aligned to VTU CSE-AIML 5th Sem curriculum
            </p>
          </div>
        </div>

        <button
          onClick={fetchHistory}
          className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          title="Refresh conversation"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto py-6 space-y-5">
        {messages.map((m, idx) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={idx}
              className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-indigo-400 border border-slate-700'
                }`}
              >
                {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              <div
                className={`max-w-2xl rounded-2xl px-5 py-3.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-none prose prose-sm'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-slate-800 text-indigo-400 flex items-center justify-center flex-shrink-0">
              <Bot className="h-4 w-4" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 text-xs text-slate-500 flex items-center space-x-2">
              <div className="h-2 w-2 bg-indigo-500 rounded-full animate-pulse" />
              <div className="h-2 w-2 bg-indigo-500 rounded-full animate-pulse delay-75" />
              <div className="h-2 w-2 bg-indigo-500 rounded-full animate-pulse delay-150" />
              <span>Analyzing academic concepts & generating pedagogical breakdown...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="py-2 flex flex-wrap gap-1.5">
        {samplePrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="text-[11px] px-3 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 rounded-full border border-slate-200 font-medium transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="pt-3 border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-3"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask anything about Software Engineering, Networks, Theory of Computation..."
            className="flex-1 px-4 py-3 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 bg-white shadow-xs"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !inputQuery.trim()}
            className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-colors disabled:opacity-50 flex-shrink-0"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
