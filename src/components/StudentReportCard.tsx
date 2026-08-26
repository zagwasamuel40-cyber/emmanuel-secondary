import React from "react";
import { usePortalSettings } from "../data/portalSettingsData";

interface StudentReportCardProps {
  session: string;
  term: string;
  student: any;
}

export function StudentReportCard({ session, term, student }: StudentReportCardProps) {
  const [portalSettings] = usePortalSettings();

  const mockSubjects = [
    { name: "BUSINESS EDUCATION", ca1: 10, ca2: 7, ca3: 9, ca4: 10, exam: 53 },
    { name: "CHRISTIANS RELIGIOUS KNOWLEDGE", ca1: 4, ca2: 5, ca3: 7, ca4: 8, exam: 46 },
    { name: "CULTURAL & CREATIVE ARTS", ca1: 4, ca2: 10, ca3: 10, ca4: 10, exam: 34 },
    { name: "DIGITAL TECHNOLOGIES", ca1: 8, ca2: 8, ca3: 5, ca4: 7, exam: 27 },
    { name: "ENGLISH LANGUAGE", ca1: 9, ca2: 8, ca3: 7, ca4: 9, exam: 44 },
    { name: "HISTORY", ca1: 8, ca2: 2, ca3: 5, ca4: 10, exam: 21 },
    { name: "INTERMEDIATE SCIENCE", ca1: 7, ca2: 5, ca3: 5, ca4: 10, exam: 39 },
    { name: "LITERATURE IN ENGLISH", ca1: 8, ca2: 10, ca3: 6, ca4: 8, exam: 35 },
    { name: "MATHEMATICS", ca1: 5, ca2: 10, ca3: 10, ca4: 7, exam: 37 },
    { name: "PHYSICAL AND HEALTH EDUCATION", ca1: 9, ca2: 6, ca3: 5, ca4: 5, exam: 31 },
    { name: "SOCIAL & CITIZENSHIP STUDIES", ca1: 8, ca2: 7, ca3: 7, ca4: 7, exam: 52 },
    { name: "TIV LANGUAGE", ca1: 9, ca2: 9, ca3: 8, ca4: 8, exam: 42 },
  ];

  const calculateGrade = (total: number) => {
    if (total >= 70) return { grade: "A", remark: "Pass" };
    if (total >= 60) return { grade: "B", remark: "Pass" };
    if (total >= 50) return { grade: "C", remark: "Pass" };
    if (total >= 40) return { grade: "D", remark: "Pass" };
    return { grade: "F", remark: "Fail" };
  };

  const results = mockSubjects.map((s) => {
    const caTotal = s.ca1 + s.ca2 + s.ca3 + s.ca4;
    const total = caTotal + s.exam;
    return {
      ...s,
      caTotal,
      total,
      lowest: Math.max(10, total - Math.floor(Math.random() * 20)),
      highest: Math.min(100, total + Math.floor(Math.random() * 20)),
      average: (total * 0.9 + Math.random() * 5).toFixed(1),
      position: `${Math.floor(Math.random() * 15) + 1}${['st','nd','rd','th'][Math.min(3, Math.floor(Math.random() * 4))]}`,
      ...calculateGrade(total)
    };
  });

  const overallTotal = results.reduce((acc, curr) => acc + curr.total, 0);
  const average = (overallTotal / results.length).toFixed(1);

  return (
    <div className="bg-white p-4 sm:p-8 min-w-[900px] shadow-sm max-w-[1000px] mx-auto print:p-0 print:shadow-none print:w-full print:max-w-none" style={{ fontFamily: 'Arial, sans-serif' }}>
      
      {/* Header Section */}
      <div className="flex justify-between items-center mb-1">
        <div className="w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center relative">
          <div className="absolute inset-0 bg-blue-100 rounded-full opacity-20"></div>
          {portalSettings.logoUrl ? (
            <img src={portalSettings.logoUrl} alt="Logo" className="max-w-full max-h-full rounded-full object-cover shadow-sm p-1 bg-white border border-slate-200" />
          ) : (
            <div className="w-20 h-20 bg-slate-200 rounded-full border-2 border-slate-300" />
          )}
        </div>
        
        <div className="flex-1 text-center px-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#6a8e23] uppercase tracking-wide mb-1" style={{ color: '#88a825' }}>
            {portalSettings.schoolName}
          </h1>
          <p className="text-[#d4af37] font-semibold text-sm sm:text-base mb-0.5">
            {portalSettings.address}
          </p>
          <p className="text-[#d4af37] font-semibold text-sm sm:text-base mb-0.5">
            Site: {portalSettings.website}
          </p>
          <p className="text-[#d4af37] font-semibold text-sm sm:text-base">
            Phone: {portalSettings.contactPhone}
          </p>
        </div>
        
        <div className="w-24 h-24 sm:w-28 sm:h-32 bg-white flex items-center justify-center overflow-hidden border-2 border-slate-300 shadow-sm">
          {student?.passportUrl ? (
            <img src={student.passportUrl} alt="Student" className="w-full h-full object-cover" />
          ) : (
            <div className="text-center">
              <span className="text-xs text-slate-400 font-bold uppercase">Passport<br/>Photo</span>
            </div>
          )}
        </div>
      </div>

      {/* Term/Session Banner */}
      <div className="bg-[#00ffff] text-center py-1 mb-2 font-bold text-black border-[1.5px] border-black uppercase text-sm leading-tight tracking-wide mx-auto w-[400px]">
        {term.toUpperCase()} RESULT<br />
        {session} SESSION
      </div>

      {/* Student Details */}
      <div className="border-[1.5px] border-black mb-2 text-xs font-bold uppercase flex flex-col bg-white w-full max-w-[830px]">
        <div className="border-b-[1.5px] border-black p-1.5 flex justify-center gap-6 text-center">
          <span>NAME: {student?.name || 'N/A'}</span>
          <span>ADMNO: {(student?.id || '').replace('STD-', '')}</span>
          <span>CLASS: {student?.class || 'JSS 1A'}</span>
        </div>
        <div className="p-1.5 flex justify-center gap-6 text-center">
          <span>GENDER: {student?.gender || 'FEMALE'}</span>
          <span>SUBJECTS TAKEN: {results.length}</span>
          <span>ATTENDANCE : 128 DAYS OUT OF 130</span>
        </div>
      </div>

      {/* Tables Section */}
      <div className="flex gap-2">
        {/* Main Result Table */}
        <div className="flex-[1] overflow-hidden">
          <table className="w-full border-collapse border-[1.5px] border-black text-[10px] text-center bg-white" style={{ tableLayout: 'fixed' }}>
            <thead>
              <tr className="font-bold border-b-[1.5px] border-black leading-tight">
                <th className="border-r-[1.5px] border-black p-1 text-left w-[120px] whitespace-normal">SUBJECT</th>
                <th className="border-r-[1.5px] border-black p-1 w-7">CA1</th>
                <th className="border-r-[1.5px] border-black p-1 w-7">CA2</th>
                <th className="border-r-[1.5px] border-black p-1 w-7">CA3</th>
                <th className="border-r-[1.5px] border-black p-1 w-7">CA4</th>
                <th className="border-r-[1.5px] border-black p-1 w-[46px]">CA<br/>TOTAL</th>
                <th className="border-r-[1.5px] border-black p-1 w-10">EXAM</th>
                <th className="border-r-[1.5px] border-black p-1 w-11">TOTAL</th>
                <th className="border-r-[1.5px] border-black p-1 w-12">LOWEST</th>
                <th className="border-r-[1.5px] border-black p-1 w-12">HIGHEST</th>
                <th className="border-r-[1.5px] border-black p-1 w-14">AVERAGE</th>
                <th className="border-r-[1.5px] border-black p-1 w-[52px]">POSITION</th>
                <th className="border-r-[1.5px] border-black p-1 w-10">GRADE</th>
                <th className="border-black p-1 w-12">REMARK</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i} className="border-b-[1.5px] border-black">
                  <td className="border-r-[1.5px] border-black p-1 text-left font-semibold uppercase leading-tight truncate px-1.5" title={r.name}>{r.name}</td>
                  <td className="border-r-[1.5px] border-black p-1">{r.ca1}</td>
                  <td className="border-r-[1.5px] border-black p-1">{r.ca2}</td>
                  <td className="border-r-[1.5px] border-black p-1">{r.ca3}</td>
                  <td className="border-r-[1.5px] border-black p-1">{r.ca4}</td>
                  <td className="border-r-[1.5px] border-black p-1">{r.caTotal}</td>
                  <td className="border-r-[1.5px] border-black p-1">{r.exam}</td>
                  <td className="border-r-[1.5px] border-black p-1 font-bold">{r.total}</td>
                  <td className="border-r-[1.5px] border-black p-1">{r.lowest}</td>
                  <td className="border-r-[1.5px] border-black p-1">{r.highest}</td>
                  <td className="border-r-[1.5px] border-black p-1">{r.average}</td>
                  <td className="border-r-[1.5px] border-black p-1">{r.position}</td>
                  <td className="border-r-[1.5px] border-black p-1">{r.grade}</td>
                  <td className="border-black p-1">{r.remark}</td>
                </tr>
              ))}
              <tr className="font-bold border-t-[1.5px] border-black uppercase text-[10px]">
                <td className="border-r-[1.5px] border-black p-1.5 text-left bg-gray-50/50" colSpan={7}>
                  OVERALL TOTAL <span className="ml-2">{overallTotal}</span>
                </td>
                <td className="border-r-[1.5px] border-black p-1.5 bg-gray-50/50"></td>
                <td className="border-black p-1.5 bg-gray-50/50" colSpan={6}></td>
              </tr>
              <tr className="font-bold border-t-[1.5px] border-black uppercase text-[10px]">
                <td className="border-black p-1.5 text-left bg-gray-50/50" colSpan={14}>
                  AVERAGE <span className="ml-2">{average}</span>
                </td>
              </tr>
              <tr className="font-bold border-t-[1.5px] border-black uppercase text-[10px]">
                <td className="border-r-[1.5px] border-black p-1.5 text-left bg-gray-50/50" colSpan={4}>POSITION 6TH</td>
                <td className="border-r-[1.5px] border-black p-1.5 text-left bg-gray-50/50" colSpan={4}>OUT OF 23</td>
                <td className="border-r-[1.5px] border-black p-1.5 text-left bg-gray-50/50" colSpan={3}>TERM BEGAN <span className="font-medium">2026/4/5</span></td>
                <td className="border-black p-1.5 text-left bg-gray-50/50" colSpan={3}>ENDED <span className="font-medium">2026/7/24</span></td>
              </tr>
              <tr className="font-bold border-t-[1.5px] border-black uppercase text-[10px]">
                <td className="border-black p-1.5 text-left bg-gray-50/50" colSpan={14}>
                  NEXT TERM BEGINS: <span className="font-medium">2026/9/6</span>
                </td>
              </tr>
              <tr className="font-bold border-t-[1.5px] border-black uppercase text-[10px]">
                <td className="border-black p-1.5 text-left bg-gray-50/50" colSpan={14}>
                  PRINCIPAL'S REMARK: <span className="font-medium">A VERY GOOD RESULT, KEEP IT UP</span>
                </td>
              </tr>
              <tr className="font-bold border-t-[1.5px] border-black uppercase text-[10px] relative">
                <td className="border-black p-1.5 text-left h-14 align-top bg-gray-50/50" colSpan={14}>
                  PRINCIPAL'S NAME: <span className="font-medium">{portalSettings.principalName.toUpperCase()}</span>
                  {portalSettings.principalSignatureUrl && (
                    <img 
                      src={portalSettings.principalSignatureUrl} 
                      alt="Signature" 
                      className="absolute left-[30%] bottom-1 h-12 object-contain mix-blend-multiply opacity-80" 
                    />
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Side Tables */}
        <div className="w-[120px] shrink-0 flex flex-col gap-0">
          <table className="w-full border-collapse border-[1.5px] border-black text-[10px] text-center bg-white">
            <thead>
              <tr className="font-bold border-b-[1.5px] border-black bg-gray-50/50">
                <th className="border-r-[1.5px] border-black p-1 leading-tight">Affective<br/>Development</th>
                <th className="p-1 w-6"></th>
              </tr>
            </thead>
            <tbody className="leading-tight">
              {[
                { n: "Attentiveness", v: 4 },
                { n: "Attendance", v: 5 },
                { n: "Punctuality", v: 5 },
                { n: "Neatness", v: 5 },
                { n: "Politness", v: 4 },
                { n: "Rel. With Others", v: 4 },
                { n: "Curiosity", v: 4 },
                { n: "Honesty", v: 4 },
                { n: "Humility", v: 4 },
                { n: "Tolerance", v: 3 },
                { n: "Leadership", v: 5 },
                { n: "Courage", v: 5 }
              ].map(a => (
                <tr key={a.n} className="border-b-[1.5px] border-black last:border-b-0">
                  <td className="border-r-[1.5px] border-black p-[3px] text-left pl-1 font-medium text-[9px]">{a.n}</td>
                  <td className="p-[3px] font-bold text-[9px]">{a.v}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <table className="w-full border-collapse border-l-[1.5px] border-r-[1.5px] border-b-[1.5px] border-black text-[10px] text-center bg-white mt-[-1.5px]">
            <thead>
              <tr className="font-bold border-y-[1.5px] border-black bg-gray-50/50">
                <th className="border-r-[1.5px] border-black p-1 leading-tight">Psychomotor<br/>Skills</th>
                <th className="p-1 w-6"></th>
              </tr>
            </thead>
            <tbody className="leading-tight">
              {[
                { n: "Handwriting", v: 5 },
                { n: "Fluency", v: 4 },
                { n: "Games/Sports", v: 4 },
                { n: "Music Skills", v: 4 },
                { n: "Construction", v: 5 }
              ].map(a => (
                <tr key={a.n} className="border-b-[1.5px] border-black last:border-b-0">
                  <td className="border-r-[1.5px] border-black p-[3px] text-left pl-1 font-medium text-[9px]">{a.n}</td>
                  <td className="p-[3px] font-bold text-[9px]">{a.v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
