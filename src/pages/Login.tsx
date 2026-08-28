import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BookOpen, User, Lock, ArrowRight, CheckCircle2, Shield, GraduationCap, Users, Sparkles, AlertCircle } from "lucide-react";
import { usePortalSettings } from "../data/portalSettingsData";
import { useTeachers } from "../data/teachersData";
import { useStudents } from "../data/studentsData";
import { Button, Card, CardContent, Input, Label } from "@/src/components/ui";

export default function Login() {
  const [portalSettings] = usePortalSettings();
  const [teachers] = useTeachers();
  const [students] = useStudents();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Forgot Password State
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: Code, 3: New Pass, 4: Success
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPass, setNewPass] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setTimeout(() => {
      setResetLoading(false);
      setForgotStep(2);
    }, 1500);
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setTimeout(() => {
      setResetLoading(false);
      setForgotStep(3);
    }, 1000);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setTimeout(() => {
      setResetLoading(false);
      setForgotStep(4);
    }, 1500);
  };

  const [detectedRole, setDetectedRole] = useState<'student' | 'teacher' | 'admin' | 'superadmin' | 'portaladmin' | null>(null);

  // Helper to determine role from credentials
  const detectRole = (inputVal: string): 'student' | 'teacher' | 'admin' | 'superadmin' | 'portaladmin' => {
    const val = inputVal.trim().toLowerCase();
    if (val.includes('portal') || val.includes('motto') || val.includes('news')) {
      return 'portaladmin';
    }
    if (val.includes('superadmin') || val.includes('super_admin') || val.includes('admission')) {
      return 'superadmin';
    }
    if (val.includes('student') || val.startsWith('ess/') || val.includes('@student.')) {
      return 'student';
    }
    if (val.includes('teacher') || val.includes('staff') || val.startsWith('tch/') || val.includes('@staff.') || val.includes('@teacher.')) {
      return 'teacher';
    }
    if (val.includes('admin') || val === 'admin') {
      return 'admin';
    }
    // Default fallback based on pattern
    if (/^\d+$/.test(val) || val.startsWith('ess')) {
      return 'student';
    }
    return 'admin';
  };

  const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setIdentifier(value);
    if (value.trim().length > 2) {
      setDetectedRole(detectRole(value));
    } else {
      setDetectedRole(null);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    setTimeout(() => {
      const searchId = identifier.trim().toLowerCase();
      
      // Check teachers
      const matchedTeacher = teachers.find(t => 
        t.id.toLowerCase() === searchId || 
        t.email.toLowerCase() === searchId
      );

      if (matchedTeacher) {
        if (matchedTeacher.password === password) {
          localStorage.setItem('loggedInUserId', matchedTeacher.id);
          let role = 'teacher';
          
          if (matchedTeacher.systemRole === 'Admin' || matchedTeacher.systemRole === 'Super Admin') {
            role = 'admin';
          } else if (matchedTeacher.systemRole === 'Admission Officer') {
            role = 'superadmin';
          } else if (matchedTeacher.systemRole === 'Portal Admin') {
            role = 'portaladmin';
          }
          
          localStorage.setItem('userRole', role);
          setLoading(false);
          
          if (role === 'teacher') navigate('/dashboard/students');
          else if (role === 'superadmin') navigate('/dashboard/admissions');
          else if (role === 'portaladmin') navigate('/dashboard/portal-manager');
          else navigate('/dashboard'); // admin has full access
          return;
        } else {
          setLoading(false);
          setErrorMsg("Invalid password for staff account.");
          return;
        }
      }

      // Check students (Basic mock check for now)
      const matchedStudent = students.find(s => 
        s.id.toLowerCase() === searchId
      );

      if (matchedStudent) {
        // Students might not have passwords in the initial mock data, we just check if ID matches
        // But if you want a basic password check for demo:
        if (password === 'password123') {
          localStorage.setItem('loggedInStudentId', matchedStudent.id);
          localStorage.setItem('userRole', 'student');
          setLoading(false);
          navigate('/student');
          return;
        } else {
          setLoading(false);
          setErrorMsg("Invalid password for student account.");
          return;
        }
      }
      
      // Fallback for hardcoded admin if not in DB (for safety)
      if (searchId === 'admin' || searchId === 'admin@ess.edu.ng') {
        localStorage.setItem('userRole', 'admin');
        setLoading(false);
        navigate('/dashboard');
        return;
      }

      setLoading(false);
      setErrorMsg("Account not found. Please check your credentials.");
    }, 800);
  };

  // Demo Login Quick Fillers
  const fillDemo = (demoType: 'student' | 'teacher' | 'admin' | 'superadmin' | 'portaladmin') => {
    if (demoType === 'student') {
      setIdentifier('ESS/2026/001');
      setPassword('password123');
      setDetectedRole('student');
    } else if (demoType === 'teacher') {
      setIdentifier('TCH/2026/042');
      setPassword('teacher123');
      setDetectedRole('teacher');
    } else if (demoType === 'superadmin') {
      setIdentifier('admission@ess.edu.ng');
      setPassword('admission123');
      setDetectedRole('superadmin');
    } else if (demoType === 'portaladmin') {
      setIdentifier('portaladmin@ess.edu.ng');
      setPassword('portal123');
      setDetectedRole('portaladmin');
    } else {
      setIdentifier('admin@ess.edu.ng');
      setPassword('admin123');
      setDetectedRole('admin');
    }
  };

  return (
    <>
      
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <Card className="w-full max-w-sm border-0 shadow-2xl animate-in zoom-in-95">
            <CardContent className="p-6">
              {forgotStep === 1 && (
                <form onSubmit={handleSendCode} className="space-y-4">
                  <div className="text-center mb-4">
                    <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-2">
                      <Lock size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Reset Password</h3>
                    <p className="text-sm text-slate-500">Enter your email or ID to receive a code.</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Email or ID</Label>
                    <Input required value={resetEmail} onChange={e => setResetEmail(e.target.value)} placeholder="e.g. johndoe@school.edu.ng" />
                  </div>
                  <div className="pt-2 flex gap-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setForgotModalOpen(false)}>Cancel</Button>
                    <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" disabled={resetLoading}>
                      {resetLoading ? "Sending..." : "Send Code"}
                    </Button>
                  </div>
                </form>
              )}

              {forgotStep === 2 && (
                <form onSubmit={handleVerifyCode} className="space-y-4">
                  <div className="text-center mb-4">
                    <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-2">
                      <Shield size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Enter Verification Code</h3>
                    <p className="text-sm text-slate-500">We sent a 6-digit code to your email.</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Verification Code</Label>
                    <Input required value={resetCode} onChange={e => setResetCode(e.target.value)} placeholder="123456" className="text-center tracking-widest text-lg font-bold" maxLength={6} />
                    <p className="text-xs text-center text-slate-500 mt-2">Use <span className="font-bold text-slate-700">123456</span> for demo.</p>
                  </div>
                  <div className="pt-2 flex gap-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setForgotStep(1)}>Back</Button>
                    <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white" disabled={resetLoading || resetCode.length < 4}>
                      {resetLoading ? "Verifying..." : "Verify Code"}
                    </Button>
                  </div>
                </form>
              )}

              {forgotStep === 3 && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="text-center mb-4">
                    <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-2">
                      <Lock size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Create New Password</h3>
                    <p className="text-sm text-slate-500">Enter a new secure password.</p>
                  </div>
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input required type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="••••••••" />
                  </div>
                  <div className="pt-2">
                    <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" disabled={resetLoading || newPass.length < 6}>
                      {resetLoading ? "Resetting..." : "Reset Password"}
                    </Button>
                  </div>
                </form>
              )}

              {forgotStep === 4 && (
                <div className="text-center space-y-4 py-4">
                  <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-2">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Password Reset!</h3>
                  <p className="text-sm text-slate-500">Your password has been successfully reset. You can now login.</p>
                  <Button className="w-full mt-4" variant="brand" onClick={() => setForgotModalOpen(false)}>
                    Back to Login
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div className="flex flex-col items-center text-center">
          <Link to="/" className="w-16 h-16 bg-brand-900 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-brand-900/20">
            <BookOpen size={32} />
          </Link>
          <h2 className="text-3xl font-bold font-heading text-slate-900">
            Unified Portal Access
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {portalSettings.schoolName} Management System
          </p>
        </div>

        <Card className="border-0 shadow-xl shadow-slate-200/50">
          <CardContent className="p-8">
            <form className="space-y-5" onSubmit={handleLogin}>
              {errorMsg && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg flex items-start gap-2 text-sm font-medium">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <p>{errorMsg}</p>
                </div>
              )}
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="identifier">
                      Admission No / Staff ID / Email / Username
                    </Label>
                    {detectedRole && (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize flex items-center gap-1 ${
                        detectedRole === 'student' ? 'bg-indigo-100 text-indigo-700' :
                        detectedRole === 'teacher' ? 'bg-emerald-100 text-emerald-700' :
                        detectedRole === 'superadmin' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                        detectedRole === 'portaladmin' ? 'bg-purple-100 text-purple-800 border border-purple-300' :
                        'bg-brand-100 text-brand-800'
                      }`}>
                        <Sparkles size={12} /> {
                          detectedRole === 'superadmin' ? 'Admission Officer' : 
                          detectedRole === 'portaladmin' ? 'Portal Admin' : 
                          `${detectedRole} Detected`
                        }
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User size={18} />
                    </div>
                    <Input
                      id="identifier"
                      name="identifier"
                      type="text"
                      required
                      value={identifier}
                      onChange={handleIdentifierChange}
                      className="pl-10"
                      placeholder="e.g. ESS/2026/001 or admin@ess.edu.ng"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <button type="button" onClick={() => {setForgotModalOpen(true); setForgotStep(1); setResetEmail(''); setResetCode(''); setNewPass('');}} className="text-xs font-medium text-brand-600 hover:text-brand-500">
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock size={18} />
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                variant="brand" 
                className="w-full h-11 text-base font-semibold"
                disabled={loading}
              >
                {loading ? 'Authenticating Role...' : 'Sign In to Portal'}
                {!loading && <ArrowRight size={18} className="ml-2" />}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
              <p className="text-xs text-center font-medium text-slate-500">
                ⚡ Quick Demo Sign-In (Auto-Detects Role):
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => fillDemo('student')}
                  className="p-2 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 rounded-lg text-xs font-medium text-slate-700 flex flex-col items-center gap-1 transition-all"
                >
                  <GraduationCap size={16} className="text-indigo-600" />
                  <span>Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo('teacher')}
                  className="p-2 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 rounded-lg text-xs font-medium text-slate-700 flex flex-col items-center gap-1 transition-all"
                >
                  <Users size={16} className="text-emerald-600" />
                  <span>Teacher</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo('admin')}
                  className="p-2 border border-slate-200 hover:border-brand-300 hover:bg-brand-50/50 rounded-lg text-xs font-medium text-slate-700 flex flex-col items-center gap-1 transition-all"
                >
                  <Shield size={16} className="text-brand-600" />
                  <span>Admin</span>
                </button>

              </div>

            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}


