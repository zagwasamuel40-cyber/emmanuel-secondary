const fs = require('fs');

const replaceInFile = (path, replacements) => {
  if (!fs.existsSync(path)) return;
  let file = fs.readFileSync(path, 'utf8');
  let original = file;
  for (const [from, to] of replacements) {
    file = file.replaceAll(from, to);
  }
  if (file !== original) {
    fs.writeFileSync(path, file);
    console.log(`Updated ${path}`);
  }
};

replaceInFile('src/pages/students/HeadTeacherComments.tsx', [
  ['{students.map(s => (\n                    <option key={s.id}', '{students.map((s, idx) => (\n                    <option key={`${s.id}_${idx}`}' ],
]);

replaceInFile('src/pages/students/StudentSkills.tsx', [
  ['{students.map(s => (\n                  <option key={s.id}', '{students.map((s, idx) => (\n                  <option key={`${s.id}_${idx}`}' ],
]);

replaceInFile('src/pages/Dashboard.tsx', [
  ['{initialStudentsList.map((st) => (\n                        <option key={st.id}', '{initialStudentsList.map((st, idx) => (\n                        <option key={`${st.id}_${idx}`}' ],
]);

replaceInFile('src/pages/Examinations.tsx', [
  ['{filteredScores.map(student => {', '{filteredScores.map((student, idx) => {'],
  ['<tr key={student.id} className="hover:bg-slate-50/50 transition-colors">', '<tr key={`${student.id}_${idx}`} className="hover:bg-slate-50/50 transition-colors">'],
  
  ['{rankedStudents.map((student, rankIdx) => {', '{rankedStudents.map((student, rankIdx) => {'],
  ['<tr key={student.id} className="hover:bg-slate-900 transition-colors">', '<tr key={`${student.id}_${rankIdx}`} className="hover:bg-slate-900 transition-colors">'],

  ['{filteredScores.map(s => (', '{filteredScores.map((s, idx) => ('],
  ['<tr key={s.id} className="hover:bg-slate-50">', '<tr key={`${s.id}_${idx}`} className="hover:bg-slate-50">'],
  
  ['{filteredScores.map((s, idx) => {', '{filteredScores.map((s, idx) => {'],
  ['<tr key={s.id} className="hover:bg-slate-900">', '<tr key={`${s.id}_${idx}`} className="hover:bg-slate-900">'],
]);

