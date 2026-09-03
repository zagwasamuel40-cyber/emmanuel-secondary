import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@/src/components/ui";
import { 
  Users, BookOpen, GraduationCap, Download, CheckCircle, 
  X, FileText, Clock, Bell, Book
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Teacher } from "../../data/teachersData";

const performanceData = [
  { name: 'Jan', attendance: 92, performance: 78 },
  { name: 'Feb', attendance: 95, performance: 82 },
  { name: 'Mar', attendance: 94, performance: 85 },
  { name: 'Apr', attendance: 96, performance: 88 },
  { name: 'May', attendance: 98, performance: 86 },
  { name: 'Jun', attendance: 97, performance: 91 },
];

export default function TeacherDashboard({ teacher, stats, sessions, newsList }: { teacher: Teacher, stats: any[], sessions: string[], newsList: any[] }) {
  const [notificationMsg, setNotificationMsg] = useState("");
  
  return (
    <div className="space-y-6">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-heading text-slate-900">Teacher Dashboard</h2>
          <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
            Welcome back, {teacher?.name || "Teacher"}. 
            <span className="inline-flex px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider border border-slate-200">
              Teacher
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 bg-white" onClick={() => window.print()}>
            <Download size={16} />
            Print Report
          </Button>
        </div>
      </div>

      {notificationMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center justify-between animate-in fade-in shadow-sm">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <CheckCircle size={20} className="text-emerald-600 shrink-0" />
            <span>{notificationMsg}</span>
          </div>
          <button onClick={() => setNotificationMsg("")} className="text-emerald-600 hover:text-emerald-800">
            <X size={18} />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">{stat.title}</p>
                  <h4 className="text-2xl font-bold font-heading text-slate-900">{stat.value}</h4>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-none">
            <CardTitle>Class Academic Performance vs Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPerformance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="attendance" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorAttendance)" />
                  <Area type="monotone" dataKey="performance" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorPerformance)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Assigned Classes & Subjects */}
        <div className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4 border-b border-slate-100">
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen size={18} className="text-brand-600" />
                My Assigned Classes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 max-h-[180px] overflow-y-auto">
                {(teacher?.assignedClasses || []).map((c, i) => (
                  <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <span className="text-sm font-semibold text-slate-900">{c}</span>
                    <Button variant="outline" size="sm" className="h-7 text-xs">View Class</Button>
                  </div>
                ))}
                {(!teacher?.assignedClasses || teacher.assignedClasses.length === 0) && (
                  <div className="p-6 text-center text-sm text-slate-500">No classes assigned.</div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4 border-b border-slate-100">
              <CardTitle className="text-base flex items-center gap-2">
                <Book size={18} className="text-brand-600" />
                My Subjects
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 max-h-[180px] overflow-y-auto">
                {(teacher?.subjects || []).map((s, i) => (
                  <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <span className="text-sm font-semibold text-slate-900">{s}</span>
                  </div>
                ))}
                {(!teacher?.subjects || teacher.subjects.length === 0) && (
                  <div className="p-6 text-center text-sm text-slate-500">No subjects assigned.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4 border-b border-slate-100">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell size={18} className="text-brand-600" />
              Latest News & Announcements
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {newsList.slice(0, 3).map((news) => (
                <div key={news.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-brand-50 text-brand-700">
                      {news.category}
                    </span>
                    <span className="text-xs text-slate-400">{new Date(news.date).toLocaleDateString()}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-1">{news.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-2">{news.content}</p>
                </div>
              ))}
              {newsList.length === 0 && (
                <div className="p-6 text-center text-sm text-slate-500">No news available.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
