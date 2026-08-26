const fs = require('fs');
let file = fs.readFileSync('src/pages/Examinations.tsx', 'utf8');

const target1 = `            {/* 8. Check Student's Result */}
            <Button
              variant="outline"
              className="bg-slate-800/90 border-slate-700 text-slate-100 hover:bg-cyan-900 hover:text-white justify-start gap-2 h-10 shadow-sm"
              onClick={() => { setIsNewFormat(false); setActiveModal("check_student_result"); }}
            >
              <UserCheck size={15} className="text-cyan-400 shrink-0" />
              <span className="truncate">Check Student's Result</span>
            </Button>

            {/* 9. Check Student's Result (New Format) */}
            <Button
              variant="outline"
              className="bg-slate-800/90 border-slate-700 text-slate-100 hover:bg-pink-900 hover:text-white justify-start gap-2 h-10 shadow-sm"
              onClick={() => { setIsNewFormat(true); setActiveModal("check_student_result"); }}
            >
              <Award size={15} className="text-pink-400 shrink-0" />
              <span className="truncate">Check Student's Result (New Format)</span>
            </Button>`;

const replacement1 = `            {/* 8. Check Student's Result */}
            <Button
              variant="outline"
              className="bg-slate-800/90 border-slate-700 text-slate-100 hover:bg-cyan-900 hover:text-white justify-start gap-2 h-10 shadow-sm"
              onClick={() => { setIsNewFormat(true); setActiveModal("check_student_result"); }}
            >
              <UserCheck size={15} className="text-cyan-400 shrink-0" />
              <span className="truncate">Check Student's Result</span>
            </Button>`;

const target2 = `              <Button 
                variant="outline" 
                className="bg-slate-900 border-slate-800 text-slate-100 hover:bg-brand-800 justify-start gap-2 h-10"
                onClick={() => { setIsNewFormat(false); setActiveModal("check_student_result"); }}
              >
                <UserCheck size={14} className="text-cyan-400" /> Check Student's Result
              </Button>

              <Button 
                variant="outline" 
                className="bg-slate-900 border-slate-800 text-slate-100 hover:bg-brand-800 justify-start gap-2 h-10"
                onClick={() => { setIsNewFormat(true); setActiveModal("check_student_result"); }}
              >
                <Award size={14} className="text-pink-400" /> Check Student's Result (New Format)
              </Button>`;

const replacement2 = `              <Button 
                variant="outline" 
                className="bg-slate-900 border-slate-800 text-slate-100 hover:bg-brand-800 justify-start gap-2 h-10"
                onClick={() => { setIsNewFormat(true); setActiveModal("check_student_result"); }}
              >
                <UserCheck size={14} className="text-cyan-400" /> Check Student's Result
              </Button>`;

const target3 = `{isNewFormat ? "Check Student Result (New Format)" : "Check Student Result"}`;
const replacement3 = `"Check Student Result"`;

file = file.replace(target1, replacement1);
file = file.replace(target2, replacement2);
file = file.replace(target3, replacement3);

fs.writeFileSync('src/pages/Examinations.tsx', file);
