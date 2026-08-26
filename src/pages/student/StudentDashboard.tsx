import React, { useEffect, useState } from "react";
import { useStudents } from "../../data/studentsData";
import { useAnnouncements, Announcement } from "../../data/announcementsData";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@/src/components/ui";
import { BookOpen, Calendar, Clock, CreditCard, Award, ArrowRight, Bell, FileText, X } from "lucide-react";

export default function StudentDashboard() {
  const [students] = useStudents();
  const [announcements] = useAnnouncements();
  const [student, setStudent] = useState<any>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [showAllAnnouncements, setShowAllAnnouncements] = useState(false);

  useEffect(() => {
    const loggedInId = localStorage.getItem('loggedInStudentId');
    if (loggedInId) {
      // Find exact match or just assume first if demo
      const found = students.find(s => s.id === loggedInId || s.name.toLowerCase().includes(loggedInId.toLowerCase()));
      if (found) setStudent(found);
      else setStudent(students[0]); // default to first if arbitrary ID entered
    } else {
      setStudent(students[0]);
    }
  }, [students]);

  const activeAnnouncements = announcements.filter(a => a.active);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold font-heading text-slate-900">My Dashboard</h2>
          <p className="text-slate-500 text-sm mt-1">Overview of your academic progress and upcoming events. {student ? `Logged in as: ${student.name} (${student.class})` : ""}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm bg-brand-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-brand-600 mb-1">Current Term GPA</p>
                <h4 className="text-2xl font-bold font-heading text-brand-900">3.8</h4>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-brand-100 text-brand-700">
                <Award size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-emerald-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-600 mb-1">Attendance Rate</p>
                <h4 className="text-2xl font-bold font-heading text-emerald-900">95%</h4>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-100 text-emerald-700">
                <Calendar size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">Pending Assignments</p>
                <h4 className="text-2xl font-bold font-heading text-blue-900">3</h4>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-100 text-blue-700">
                <BookOpen size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-amber-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600 mb-1">Fee Balance</p>
                <h4 className="text-2xl font-bold font-heading text-amber-900">₦0</h4>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-amber-100 text-amber-700">
                <CreditCard size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle>Upcoming Exams & CBT</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {[
                { title: "Mathematics First Term CBT", date: "Tomorrow, 10:00 AM", type: "CBT", duration: "45 Mins" },
                { title: "English Mock Exam", date: "Oct 25, 2026", type: "Written", duration: "2 Hours" },
                { title: "Physics Practical", date: "Nov 02, 2026", type: "Practical", duration: "90 Mins" }
              ].map((exam, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Clock size={18} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{exam.title}</p>
                      <p className="text-sm text-slate-500 mt-0.5">{exam.date} &middot; {exam.duration}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg uppercase tracking-wide">
                      {exam.type}
                    </span>
                    <Button variant="outline" size="sm" className="hidden sm:flex">
                      Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="flex items-center justify-between">
              <span>Announcements</span>
              {activeAnnouncements.length > 0 && (
                <span className="text-xs font-semibold px-2 py-0.5 bg-brand-50 text-brand-700 rounded-full">
                  {activeAnnouncements.length} New
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {activeAnnouncements.slice(0, 4).map((announcement) => (
                <div 
                  key={announcement.id} 
                  className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedAnnouncement(announcement)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-brand-500 shrink-0">
                      <Bell size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 text-sm hover:text-brand-600 transition-colors">{announcement.title}</p>
                      <p className="text-xs text-slate-500 mt-1">{announcement.date}</p>
                      {announcement.content && (
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">{announcement.content}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {activeAnnouncements.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-sm">
                  No active announcements at this time.
                </div>
              )}
            </div>
            {activeAnnouncements.length > 0 && (
              <div className="p-4 border-t border-slate-100">
                <Button 
                  variant="ghost" 
                  className="w-full text-brand-600 text-sm"
                  onClick={() => setShowAllAnnouncements(true)}
                >
                  View All Announcements ({activeAnnouncements.length})
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* MODAL: ANNOUNCEMENT DETAIL */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <Card className="w-full max-w-md border-0 shadow-2xl overflow-hidden">
            <CardHeader className="bg-slate-900 text-white flex flex-row items-center justify-between pb-4">
              <div className="flex items-center gap-2">
                <Bell size={20} className="text-brand-400" />
                <CardTitle className="text-white">Announcement Details</CardTitle>
              </div>
              <button onClick={() => setSelectedAnnouncement(null)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {selectedAnnouncement.category && (
                    <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-brand-100 text-brand-800">
                      {selectedAnnouncement.category}
                    </span>
                  )}
                  <span className="text-xs text-slate-400">{selectedAnnouncement.date}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">{selectedAnnouncement.title}</h3>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">
                {selectedAnnouncement.content || selectedAnnouncement.title}
              </div>
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setSelectedAnnouncement(null)}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* MODAL: VIEW ALL ANNOUNCEMENTS */}
      {showAllAnnouncements && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <Card className="w-full max-w-2xl border-0 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
            <CardHeader className="bg-slate-900 text-white flex flex-row items-center justify-between pb-4 shrink-0">
              <div className="flex items-center gap-2">
                <Bell size={20} className="text-brand-400" />
                <CardTitle className="text-white">All School Announcements</CardTitle>
              </div>
              <button onClick={() => setShowAllAnnouncements(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </CardHeader>
            <CardContent className="p-6 overflow-y-auto divide-y divide-slate-100 space-y-4">
              {activeAnnouncements.map((announcement) => (
                <div key={announcement.id} className="pt-4 first:pt-0 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-slate-900 text-base">{announcement.title}</h4>
                    <span className="text-xs text-slate-400 shrink-0">{announcement.date}</span>
                  </div>
                  {announcement.category && (
                    <span className="inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-brand-50 text-brand-700">
                      {announcement.category}
                    </span>
                  )}
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {announcement.content || announcement.title}
                  </p>
                </div>
              ))}
            </CardContent>
            <div className="p-4 border-t border-slate-100 flex justify-end shrink-0 bg-slate-50">
              <Button variant="outline" onClick={() => setShowAllAnnouncements(false)}>
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
