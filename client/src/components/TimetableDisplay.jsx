import React from 'react';
import { Clock, MapPin, User, BookOpen, Calendar, Users } from 'lucide-react';

const TimetableDisplay = ({ timetable, viewType, title, subtitle }) => {
  const timeSlots = [
    '09:00 AM - 10:00 AM',
    '10:05 AM - 11:05 AM', 
    '11:15 AM - 12:15 PM',
    '12:20 PM - 01:20 PM',
    '02:00 PM - 03:00 PM',
    '03:05 PM - 04:05 PM',
    '04:10 PM - 05:10 PM',
    '05:15 PM - 06:15 PM'
  ];

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const getSubjectColor = (subject) => {
    const colors = {
      'MAD': 'bg-yellow-200 text-yellow-800',
      'CN': 'bg-red-200 text-red-800', 
      'ATML': 'bg-green-200 text-green-800',
      'DLD': 'bg-blue-200 text-blue-800',
      'OS': 'bg-purple-200 text-purple-800',
      'AI': 'bg-indigo-200 text-indigo-800',
      'DM': 'bg-pink-200 text-pink-800',
      'PEM': 'bg-orange-200 text-orange-800',
      'DSA': 'bg-teal-200 text-teal-800',
      'CAL': 'bg-cyan-200 text-cyan-800',
      'CF': 'bg-lime-200 text-lime-800',
      'BDA': 'bg-emerald-200 text-emerald-800',
      'SET': 'bg-violet-200 text-violet-800',
      'CEM': 'bg-rose-200 text-rose-800',
      'BT': 'bg-amber-200 text-amber-800',
      'EEP': 'bg-slate-200 text-slate-800',
      'IKS': 'bg-gray-200 text-gray-800',
      'default': 'bg-gray-100 text-gray-700'
    };
    return colors[subject?.split(' ')[0]] || colors.default;
  };

  const formatCellContent = (session) => {
    if (!session) return null;
    
    return (
      <div className={`p-2 rounded-md h-full flex flex-col justify-between text-xs ${getSubjectColor(session.subject)}`}>
        <div>
          <div className="font-semibold truncate">{session.subject}</div>
          <div className="text-xs opacity-75">{session.code}</div>
        </div>
        <div className="text-xs space-y-1">
          {viewType !== 'teacher' && session.teacher && (
            <div className="flex items-center">
              <User className="w-3 h-3 mr-1" />
              <span className="truncate">({session.teacher})</span>
            </div>
          )}
          {viewType !== 'classroom' && session.room && (
            <div className="flex items-center">
              <MapPin className="w-3 h-3 mr-1" />
              <span>{session.room}</span>
            </div>
          )}
          {viewType === 'teacher' && session.class && (
            <div className="flex items-center">
              <Users className="w-3 h-3 mr-1" />
              <span className="truncate">{session.class}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
        <div className="text-center">
          <h2 className="text-xl font-bold">SVKM's NMIMS School of Technology Management & Engineering, Navi-Mumbai</h2>
          <h3 className="text-lg mt-1">Academic Schedule of Odd Semester 2025</h3>
          <div className="mt-2 flex justify-between items-center">
            <div className="text-left">
              <div className="text-sm font-semibold">{title}</div>
              {subtitle && <div className="text-xs opacity-90">{subtitle}</div>}
            </div>
            <div className="text-right">
              <div className="text-sm">W.e.f. 14/07/2025</div>
            </div>
          </div>
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 p-2 text-xs font-semibold">Time/Day</th>
              {days.map(day => (
                <th key={day} className="border border-gray-300 p-2 text-xs font-semibold min-w-32">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((timeSlot, timeIndex) => (
              <React.Fragment key={timeIndex}>
                <tr>
                  <td className="border border-gray-300 p-2 bg-blue-50 text-xs font-medium whitespace-nowrap">
                    {timeSlot}
                  </td>
                  {days.map((day, dayIndex) => {
                    const session = timetable[timeIndex]?.[dayIndex];
                    
                    return (
                      <td key={`${timeIndex}-${dayIndex}`} className="border border-gray-300 p-1 h-20 align-top">
                        {formatCellContent(session)}
                      </td>
                    );
                  })}
                </tr>
                
                {/* Break rows */}
                {timeIndex === 1 && (
                  <tr>
                    <td className="border border-gray-300 p-2 bg-yellow-100 text-xs font-medium text-center">
                      11:05 AM - 11:15 AM
                    </td>
                    <td colSpan={6} className="border border-gray-300 p-2 bg-yellow-100 text-center text-sm font-semibold">
                      Short Break
                    </td>
                  </tr>
                )}
                
                {timeIndex === 3 && (
                  <tr>
                    <td className="border border-gray-300 p-2 bg-orange-100 text-xs font-medium text-center">
                      01:20 PM - 02:00 PM
                    </td>
                    <td colSpan={6} className="border border-gray-300 p-2 bg-orange-100 text-center text-sm font-semibold">
                      Lunch Break
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend/Summary for program view */}
      {viewType === 'program' && (
        <div className="p-4 bg-gray-50 border-t">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <h4 className="font-semibold mb-2">Subject Details</h4>
              <div className="space-y-1">
                <div><span className="font-medium">Applied Time Series Analysis (ATSA)</span> - Dr. Shailendra Aote (SA)</div>
                <div><span className="font-medium">Natural Language Processing (NLP)</span> - Dr. Abhishek Bhade (ANK)</div>
                <div><span className="font-medium">Big Data Analytics (BDA)</span> - Prof. Meet Jethwa (MJ)</div>
                <div><span className="font-medium">Advanced Topics in Machine Learning (ATML)</span> - Prof. Divesh Kubal (DK)</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Teaching Load Summary</h4>
              <div className="space-y-1">
                <div>Theory Hours: 22 | Practical Hours: 16 | Tutorial Hours: 0</div>
                <div>Total Teaching Hours per Week: <span className="font-semibold">42</span></div>
                <div>No. of Batches: Various (B1, B2, L-101, L-102, C-001, C-007, C-308)</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimetableDisplay;