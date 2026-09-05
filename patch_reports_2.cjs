const fs = require('fs');
let code = fs.readFileSync('src/pages/Reports.tsx', 'utf-8');

const classReportCode = `
  const ClassReport = () => {
    // Generate class reports grouped by class and arm
    const byClass = students.reduce((acc, student) => {
      if (!acc[student.class]) acc[student.class] = [];
      acc[student.class].push(student);
      return acc;
    }, {} as Record<string, typeof students>);

    return (
      <div id="class-reports-container">
        {Object.entries(byClass).sort((a,b) => a[0].localeCompare(b[0])).map(([cls, classStudents]) => (
          <div key={cls} className="print-page-break print-section p-8 bg-white min-h-screen">
            <ReportHeader title={\`Class Report: \${cls}\`} />
            <div className="mb-4">
              <h3 className="font-bold text-lg">Total Students: {classStudents.length}</h3>
            </div>
            <table className="w-full text-xs border-collapse border border-slate-200">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border p-2 text-left">Adm No.</th>
                  <th className="border p-2 text-left">Name</th>
                  <th className="border p-2 text-left">Gender</th>
                  <th className="border p-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {classStudents.map(s => (
                  <tr key={s.id}>
                    <td className="border p-2 font-medium">{s.admissionNumber}</td>
                    <td className="border p-2 font-bold">{s.firstName} {s.lastName}</td>
                    <td className="border p-2">{s.gender}</td>
                    <td className="border p-2">{s.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    );
  };
`;

const individualReportCode = `
  const IndividualReport = () => {
    // Render individual reports for all students (or selected, but for master we do top 5 to avoid browser crash, usually this is selected)
    const studentsToPrint = activeReport === "master" ? students.slice(0, 5) : students;
    
    return (
      <div id="individual-reports-container">
        {studentsToPrint.map(s => {
          const studentScores = scores.filter(score => score.studentId === s.id);
          return (
            <div key={s.id} className="print-page-break print-section p-8 bg-white min-h-screen">
              <ReportHeader title={\`Student Report: \${s.firstName} \${s.lastName}\`} />
              
              <div className="flex gap-8 mb-8 border-b pb-6">
                <div className="w-32 h-32 bg-slate-100 rounded border border-slate-200 overflow-hidden flex items-center justify-center">
                  {s.passportUrl ? (
                    <img src={s.passportUrl} alt={s.firstName} className="w-full h-full object-cover" />
                  ) : (
                    <User size={48} className="text-slate-300" />
                  )}
                </div>
                <div className="flex-1 grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-slate-500 font-medium">Admission No:</span> <span className="font-bold">{s.admissionNumber}</span></div>
                  <div><span className="text-slate-500 font-medium">Class:</span> <span className="font-bold">{s.class}</span></div>
                  <div><span className="text-slate-500 font-medium">Gender:</span> <span className="font-bold">{s.gender}</span></div>
                  <div><span className="text-slate-500 font-medium">Date of Birth:</span> <span className="font-bold">{s.dob || "N/A"}</span></div>
                  <div><span className="text-slate-500 font-medium">Parent/Guardian:</span> <span className="font-bold">{s.parentName}</span></div>
                  <div><span className="text-slate-500 font-medium">Phone:</span> <span className="font-bold">{s.parentPhone}</span></div>
                </div>
              </div>
              
              <h3 className="font-bold text-lg mb-4">Academic Performance</h3>
              {studentScores.length > 0 ? (
                <table className="w-full text-sm border-collapse border border-slate-200">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border p-2 text-left">Subject</th>
                      <th className="border p-2 text-center">CA</th>
                      <th className="border p-2 text-center">Exam</th>
                      <th className="border p-2 text-center">Total</th>
                      <th className="border p-2 text-center">Grade</th>
                      <th className="border p-2 text-left">Remark</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentScores.map(score => (
                      <tr key={score.id}>
                        <td className="border p-2 font-medium">{score.subject}</td>
                        <td className="border p-2 text-center">{score.ca1 + score.ca2 + score.ca3 + score.ca4}</td>
                        <td className="border p-2 text-center">{score.exam}</td>
                        <td className="border p-2 text-center font-bold">{score.total}</td>
                        <td className="border p-2 text-center font-bold">{score.grade}</td>
                        <td className="border p-2">{score.remark}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-slate-500 italic p-4 bg-slate-50 border border-slate-100 rounded">No examination records found for this student.</p>
              )}
            </div>
          );
        })}
      </div>
    );
  };
`;

code = code.replace('// --- REPORT COMPONENTS ---', '// --- REPORT COMPONENTS ---\n' + classReportCode + '\n' + individualReportCode);

code = code.replace('{selectedSections.classes && <div className="p-8">Class Reports - Select Class</div>}', '{selectedSections.classes && <ClassReport />}');
code = code.replace('{activeReport === "classes" && <div className="p-8">Class Reports - Select Class</div>}', '{activeReport === "classes" && <ClassReport />}');
code = code.replace('{activeReport === "individual" && <div className="p-8">Individual Report - Select Student</div>}', '{activeReport === "individual" && <IndividualReport />}');

fs.writeFileSync('src/pages/Reports.tsx', code);
