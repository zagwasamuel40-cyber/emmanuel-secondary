import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui";
import { Clock, Calendar as CalendarIcon } from "lucide-react";

export default function StudentTimetable() {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const [activeDay, setActiveDay] = useState("Monday");

  const timetable: Record<string, { time: string; subject: string; teacher: string; type: string }[]> = {
    "Monday": [
      { time: "08:00 AM - 08:45 AM", subject: "Mathematics", teacher: "Mr. Akpan", type: "Core" },
      { time: "08:45 AM - 09:30 AM", subject: "English Language", teacher: "Mrs. Nwachukwu", type: "Core" },
      { time: "09:30 AM - 10:15 AM", subject: "Physics", teacher: "Dr. Ojo", type: "Science" },
      { time: "10:15 AM - 10:45 AM", subject: "SHORT BREAK", teacher: "-", type: "Break" },
      { time: "10:45 AM - 11:30 AM", subject: "Chemistry", teacher: "Mr. Adeleke", type: "Science" },
      { time: "11:30 AM - 12:15 PM", subject: "Biology", teacher: "Miss. Chinda", type: "Science" },
    ],
    "Tuesday": [
      { time: "08:00 AM - 09:30 AM", subject: "Physics (Practical)", teacher: "Dr. Ojo", type: "Science" },
      { time: "09:30 AM - 10:15 AM", subject: "Economics", teacher: "Mr. Bamidele", type: "Commercial" },
      { time: "10:15 AM - 10:45 AM", subject: "SHORT BREAK", teacher: "-", type: "Break" },
      { time: "10:45 AM - 11:30 AM", subject: "Mathematics", teacher: "Mr. Akpan", type: "Core" },
      { time: "11:30 AM - 12:15 PM", subject: "Further Mathematics", teacher: "Mr. Akpan", type: "Science" },
    ],
    "Wednesday": [
      { time: "08:00 AM - 08:45 AM", subject: "English Language", teacher: "Mrs. Nwachukwu", type: "Core" },
      { time: "08:45 AM - 09:30 AM", subject: "Civic Education", teacher: "Mr. Duru", type: "Core" },
      { time: "09:30 AM - 10:15 AM", subject: "Chemistry", teacher: "Mr. Adeleke", type: "Science" },
      { time: "10:15 AM - 10:45 AM", subject: "SHORT BREAK", teacher: "-", type: "Break" },
      { time: "10:45 AM - 12:15 PM", subject: "Biology (Practical)", teacher: "Miss. Chinda", type: "Science" },
    ],
    "Thursday": [
      { time: "08:00 AM - 08:45 AM", subject: "Mathematics", teacher: "Mr. Akpan", type: "Core" },
      { time: "08:45 AM - 09:30 AM", subject: "Economics", teacher: "Mr. Bamidele", type: "Commercial" },
      { time: "09:30 AM - 10:15 AM", subject: "Physics", teacher: "Dr. Ojo", type: "Science" },
      { time: "10:15 AM - 10:45 AM", subject: "SHORT BREAK", teacher: "-", type: "Break" },
      { time: "10:45 AM - 11:30 AM", subject: "Agricultural Science", teacher: "Mrs. Okon", type: "Science" },
      { time: "11:30 AM - 12:15 PM", subject: "Geography", teacher: "Mr. Bamidele", type: "Art" },
    ],
    "Friday": [
      { time: "08:00 AM - 08:45 AM", subject: "English Language", teacher: "Mrs. Nwachukwu", type: "Core" },
      { time: "08:45 AM - 09:30 AM", subject: "Mathematics", teacher: "Mr. Akpan", type: "Core" },
      { time: "09:30 AM - 10:15 AM", subject: "Civic Education", teacher: "Mr. Duru", type: "Core" },
      { time: "10:15 AM - 10:45 AM", subject: "SHORT BREAK", teacher: "-", type: "Break" },
      { time: "10:45 AM - 12:15 PM", subject: "SPORTS / EXTRACURRICULAR", teacher: "-", type: "Break" },
    ],
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-heading text-slate-900">Class Timetable</h2>
        <p className="text-slate-500 text-sm mt-1">View your daily schedule for the week.</p>
      </div>

      <Card className="border-0 shadow-sm overflow-hidden bg-white">
        <div className="flex flex-col sm:flex-row border-b border-slate-200">
          {days.map((day) => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                activeDay === day
                  ? "bg-brand-50 text-brand-700 border-b-2 border-brand-600"
                  : "bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <CalendarIcon size={16} className={activeDay === day ? "text-brand-600" : "text-slate-400"} />
                {day}
              </div>
            </button>
          ))}
        </div>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {timetable[activeDay].map((slot, idx) => (
              <div key={idx} className={`p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${slot.type === 'Break' ? 'bg-slate-50/80' : 'hover:bg-slate-50'} transition-colors`}>
                <div className="flex items-center gap-4">
                  <div className={`w-24 shrink-0 font-semibold text-sm flex items-center gap-2 ${slot.type === 'Break' ? 'text-slate-500' : 'text-slate-900'}`}>
                    <Clock size={14} className={slot.type === 'Break' ? 'text-slate-400' : 'text-brand-500'} />
                    {slot.time.split(" - ")[0]}
                  </div>
                  <div>
                    <p className={`font-bold ${slot.type === 'Break' ? 'text-slate-500 tracking-wider' : 'text-slate-900'}`}>{slot.subject}</p>
                    {slot.type !== 'Break' && <p className="text-sm text-slate-500 mt-1">Teacher: {slot.teacher}</p>}
                  </div>
                </div>
                {slot.type !== 'Break' && (
                  <div className="shrink-0 sm:ml-auto">
                    <span className="inline-flex px-2.5 py-1 bg-brand-50 text-brand-700 text-xs font-semibold rounded-md uppercase tracking-wide">
                      {slot.type}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
