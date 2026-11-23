import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import { Calendar, Clock, MapPin, User, Coffee } from 'lucide-react';

export const StudentTimetable: React.FC = () => {
  const [timetable, setTimetable] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest('/student/timetable')
      .then((data) => setTimetable(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 font-semibold">
        Loading 5th Semester class timetable...
      </div>
    );
  }

  const currentDayData = timetable.find((d) => d.day === selectedDay) || { periods: [] };
  const morningPeriods = currentDayData.periods.slice(0, 4);
  const afternoonPeriods = currentDayData.periods.slice(4);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Academic Class Timetable</h1>
          <p className="text-xs text-slate-500 mt-1">
            Dr. T. Thimmaiah Institute of Technology • CSE-AIML • 5th Semester (2026–27)
          </p>
        </div>

        {/* Day Selector Buttons */}
        <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          {days.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedDay === day
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {/* Morning Periods (1 to 4) */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Morning Sessions (4 Periods)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {morningPeriods.map((p: any) => (
              <div
                key={p.period}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
              >
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                    Period {p.period}
                  </span>
                  <div className="flex items-center space-x-1 text-slate-500 text-[11px]">
                    <Clock className="h-3 w-3" />
                    <span>{p.time}</span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mt-2 line-clamp-1">{p.subject}</h3>
                <p className="text-[11px] font-mono font-semibold text-slate-500 mt-0.5">{p.code}</p>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1 text-xs text-slate-600">
                  <div className="flex items-center space-x-1.5">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    <span className="truncate">{p.faculty}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span className="font-medium text-slate-700">{p.room}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* LUNCH BREAK BANNER */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-center space-x-3 text-amber-900 shadow-xs">
          <Coffee className="h-5 w-5 text-amber-600" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Institutional Lunch Break: 12:10 PM – 1:40 PM
          </span>
        </div>

        {/* Afternoon Periods (5 to 7) */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Afternoon Sessions (3 Periods)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {afternoonPeriods.map((p: any) => (
              <div
                key={p.period}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
              >
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                    Period {p.period}
                  </span>
                  <div className="flex items-center space-x-1 text-slate-500 text-[11px]">
                    <Clock className="h-3 w-3" />
                    <span>{p.time}</span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mt-2 line-clamp-1">{p.subject}</h3>
                <p className="text-[11px] font-mono font-semibold text-slate-500 mt-0.5">{p.code}</p>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1 text-xs text-slate-600">
                  <div className="flex items-center space-x-1.5">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    <span className="truncate">{p.faculty}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span className="font-medium text-slate-700">{p.room}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
