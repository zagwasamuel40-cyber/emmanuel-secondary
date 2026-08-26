import React, { useState } from "react";
import { Button } from "@/src/components/ui";
import { Users, UserPlus, Upload, FileText, Activity } from "lucide-react";
import { useStudents } from "../data/studentsData";

import StudentDirectory from "./students/StudentDirectory";
import RegisterStudent from "./students/RegisterStudent";
import UploadStudents from "./students/UploadStudents";

import StudentSkills from "./students/StudentSkills";
import HeadTeacherComments from "./students/HeadTeacherComments";

export default function Students() {
  const [activeTab, setActiveTab] = useState("directory");
  const [students, setStudents] = useStudents();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading text-slate-900">Student Administration</h1>
        <p className="text-slate-500 text-sm mt-1">Manage registered studentsand skills assessments.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="md:col-span-1 flex flex-col gap-2">
          <Button 
            variant={activeTab === "directory" ? "brand" : "outline"} 
            className={`justify-start gap-3 w-full ${activeTab !== "directory" ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700' : ''}`}
            onClick={() => setActiveTab("directory")}
          >
            <Users size={18} /> Registered Students
          </Button>
          <Button 
            variant={activeTab === "register" ? "brand" : "outline"} 
            className={`justify-start gap-3 w-full ${activeTab !== "register" ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700' : ''}`}
            onClick={() => setActiveTab("register")}
          >
            <UserPlus size={18} /> Register Student
          </Button>
          <Button 
            variant={activeTab === "upload" ? "brand" : "outline"} 
            className={`justify-start gap-3 w-full ${activeTab !== "upload" ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700' : ''}`}
            onClick={() => setActiveTab("upload")}
          >
            <Upload size={18} /> Upload Admitted
          </Button>
          
          <Button 
            variant={activeTab === "skills" ? "brand" : "outline"} 
            className={`justify-start gap-3 w-full ${activeTab !== "skills" ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700' : ''}`}
            onClick={() => setActiveTab("skills")}
          >
            <Activity size={18} /> Student's Skills
          </Button>
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-3">
          {activeTab === "directory" && <StudentDirectory students={students} setStudents={setStudents} />}
          {activeTab === "register" && <RegisterStudent students={students} setStudents={setStudents} />}
          {activeTab === "upload" && <UploadStudents />}
          
          {activeTab === "skills" && <StudentSkills students={students} />}
          {activeTab === "comments" && <HeadTeacherComments students={students} />}
        </div>
      </div>
    </div>
  );
}
