import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import { Calendar, Clock, MapPin, Coffee } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const TeacherTimetable: React.FC = () => {
  const { teacher } = useAuth();
  const [timetable, setTimetable] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest('/teacher/timetable')
      .then((data) => setTimetable(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-semibold">Loading teaching schedule...</div>;
  }

  const currentDayData = timetable.find((d) => d.day === selectedDay) || { periods: [] };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Faculty Teaching Schedule</h1>
          <p className="text-xs text-slate-500 mt-1">
            Weekly class schedule for {teacher?.fullName || 'Subject Faculty'} • Dr. TTIT
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          {days.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedDay === day ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 mb-4">{selectedDay} Teaching Slots</h2>
        {currentDayData.periods && currentDayData.periods.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentDayData.periods.map((p: any, idx: number) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                    Period {p.period}
                  </span>
                  <span className="text-slate-500 flex items-center space-x-1 font-mono text-[11px]">
                    <Clock className="h-3 w-3" />
                    <span>{p.time}</span>
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{p.subject}</h3>
                <p className="text-xs text-slate-500 font-mono">{p.code}</p>
                <div className="pt-2 border-t border-slate-200 flex items-center space-x-1 text-xs text-slate-600">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span>Room: {p.room}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs">
            No teaching periods assigned on {selectedDay}.
          </div>
        )}
      </div>
    </div>
  );
};
