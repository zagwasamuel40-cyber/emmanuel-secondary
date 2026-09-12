import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label } from "@/src/components/ui";
import { 
  Sliders, Save, X, CheckCircle, AlertCircle, Percent, 
  RotateCcw, Sparkles, Layers, BookOpen, GraduationCap 
} from "lucide-react";
import { 
  useAssessmentWeightings, 
  AssessmentWeightingRule 
} from "../data/assessmentRecordingData";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  classes: string[];
  subjects: string[];
  sessions: string[];
}

export function AssessmentWeightingConfigModal({ isOpen, onClose, classes, subjects, sessions }: Props) {
  const [weightingsList, setWeightingsList] = useAssessmentWeightings();

  const [selectedClass, setSelectedClass] = useState<string>("All Classes");
  const [selectedSubject, setSelectedSubject] = useState<string>("All Subjects");
  const [selectedSession, setSelectedSession] = useState<string>(sessions[0] || "2025/2026");
  const [selectedTerm, setSelectedTerm] = useState<string>("First Term");

  // Find or default rule
  const matchedRule = weightingsList.find(r => 
    r.targetClass === selectedClass && 
    r.subject === selectedSubject && 
    r.session === selectedSession && 
    r.term === selectedTerm
  ) || weightingsList[0];

  const [weights, setWeights] = useState({
    firstTest: matchedRule?.weights?.["First Test"] ?? 10,
    secondTest: matchedRule?.weights?.["Second Test"] ?? 10,
    thirdTest: matchedRule?.weights?.["Third Test"] ?? 0,
    assignment: matchedRule?.weights?.["Assignment"] ?? 5,
    practical: matchedRule?.weights?.["Practical"] ?? 5,
    continuousAssessment: matchedRule?.weights?.["Continuous Assessment"] ?? 0,
    cbtExamination: matchedRule?.weights?.["CBT Examination"] ?? 10,
    examination: matchedRule?.weights?.["Examination"] ?? 60,
  });

  const [savedMsg, setSavedMsg] = useState("");

  if (!isOpen) return null;

  const totalWeight: number = Number(weights.firstTest) + 
    Number(weights.secondTest) + 
    Number(weights.thirdTest) + 
    Number(weights.assignment) + 
    Number(weights.practical) + 
    Number(weights.continuousAssessment) + 
    Number(weights.cbtExamination) + 
    Number(weights.examination);

  const isValid100 = totalWeight === 100;

  const handleWeightChange = (key: keyof typeof weights, value: number) => {
    setWeights(prev => ({
      ...prev,
      [key]: Math.max(0, Math.min(100, Number(value) || 0))
    }));
  };

  const handleSaveWeighting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid100) {
      alert(`The total weight must equal 100%. Current total is ${totalWeight}%.`);
      return;
    }

    const updatedRule: AssessmentWeightingRule = {
      id: matchedRule ? matchedRule.id : `WGT-${Date.now().toString(36).toUpperCase()}`,
      title: `${selectedClass} - ${selectedSubject} Assessment Weighting`,
      targetClass: selectedClass,
      subject: selectedSubject,
      term: selectedTerm,
      session: selectedSession,
      weights: {
        "First Test": weights.firstTest,
        "Second Test": weights.secondTest,
        "Third Test": weights.thirdTest,
        "Assignment": weights.assignment,
        "Practical": weights.practical,
        "Continuous Assessment": weights.continuousAssessment,
        "CBT Examination": weights.cbtExamination,
        "Examination": weights.examination,
      },
      totalWeight: 100,
      updatedAt: new Date().toISOString(),
      updatedBy: "School Administrator",
    };

    setWeightingsList(prev => {
      const filtered = prev.filter(r => !(
        r.targetClass === selectedClass && 
        r.subject === selectedSubject && 
        r.term === selectedTerm && 
        r.session === selectedSession
      ));
      return [updatedRule, ...filtered];
    });

    setSavedMsg(`Grading weighting structure saved successfully for ${selectedClass} - ${selectedSubject}!`);
    setTimeout(() => setSavedMsg(""), 3500);
  };

  const handleResetToStandard = () => {
    setWeights({
      firstTest: 10,
      secondTest: 10,
      thirdTest: 0,
      assignment: 5,
      practical: 5,
      continuousAssessment: 0,
      cbtExamination: 10,
      examination: 60,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 my-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center border border-brand-200 font-bold">
              <Sliders size={18} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                Assessment Weighting & Grading Structure
              </h3>
              <p className="text-xs text-slate-500">
                Configure how different assessment components contribute to the student's 100% final result.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X size={20} />
          </button>
        </div>

        {savedMsg && (
          <div className="p-3 mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle size={16} className="text-emerald-600 shrink-0" />
            <span>{savedMsg}</span>
          </div>
        )}

        <form onSubmit={handleSaveWeighting} className="space-y-4 text-xs">
          {/* Filters Bar: Class, Subject, Session, Term */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 font-medium">
            <div>
              <Label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Class Scope</Label>
              <select
                className="w-full h-8 px-2 rounded border border-slate-300 bg-white text-xs font-semibold text-slate-900"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <option value="All Classes">All Classes (Global)</option>
                {classes.filter(c => c !== "All Classes").map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <Label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Subject Scope</Label>
              <select
                className="w-full h-8 px-2 rounded border border-slate-300 bg-white text-xs font-semibold text-slate-900"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option value="All Subjects">All Subjects (Global)</option>
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <Label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Session</Label>
              <select
                className="w-full h-8 px-2 rounded border border-slate-300 bg-white text-xs font-semibold text-slate-900"
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
              >
                {sessions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <Label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Term</Label>
              <select
                className="w-full h-8 px-2 rounded border border-slate-300 bg-white text-xs font-semibold text-slate-900"
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
              >
                <option value="First Term">First Term</option>
                <option value="Second Term">Second Term</option>
                <option value="Third Term">Third Term</option>
              </select>
            </div>
          </div>

          {/* Weighting Inputs Grid */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-900 text-white p-2.5 px-4 flex justify-between items-center text-xs font-bold uppercase tracking-wider">
              <span>Assessment Component</span>
              <span>Weighting Contribution (%)</span>
            </div>

            <div className="divide-y divide-slate-100 p-2">
              <div className="flex items-center justify-between p-2.5 hover:bg-slate-50">
                <div>
                  <span className="font-bold text-slate-900 block">First Test</span>
                  <span className="text-[11px] text-slate-500">First continuous assessment test</span>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    className="w-20 h-8 text-center font-mono font-bold text-xs"
                    value={weights.firstTest}
                    onChange={(e) => handleWeightChange("firstTest", Number(e.target.value))}
                  />
                  <span className="text-slate-500 font-bold">%</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 hover:bg-slate-50">
                <div>
                  <span className="font-bold text-slate-900 block">Second Test</span>
                  <span className="text-[11px] text-slate-500">Second continuous assessment test</span>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    className="w-20 h-8 text-center font-mono font-bold text-xs"
                    value={weights.secondTest}
                    onChange={(e) => handleWeightChange("secondTest", Number(e.target.value))}
                  />
                  <span className="text-slate-500 font-bold">%</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 hover:bg-slate-50">
                <div>
                  <span className="font-bold text-slate-900 block">Assignment</span>
                  <span className="text-[11px] text-slate-500">Homework and assignment submissions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    className="w-20 h-8 text-center font-mono font-bold text-xs"
                    value={weights.assignment}
                    onChange={(e) => handleWeightChange("assignment", Number(e.target.value))}
                  />
                  <span className="text-slate-500 font-bold">%</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 hover:bg-slate-50">
                <div>
                  <span className="font-bold text-slate-900 block">Practical</span>
                  <span className="text-[11px] text-slate-500">Laboratory experiments & practical evaluations</span>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    className="w-20 h-8 text-center font-mono font-bold text-xs"
                    value={weights.practical}
                    onChange={(e) => handleWeightChange("practical", Number(e.target.value))}
                  />
                  <span className="text-slate-500 font-bold">%</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-purple-50/60 hover:bg-purple-50">
                <div>
                  <span className="font-bold text-purple-950 block">CBT Examination</span>
                  <span className="text-[11px] text-purple-700">Computer-based assessment score (when recorded on result)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    className="w-20 h-8 text-center font-mono font-bold text-xs text-purple-900 border-purple-300"
                    value={weights.cbtExamination}
                    onChange={(e) => handleWeightChange("cbtExamination", Number(e.target.value))}
                  />
                  <span className="text-purple-700 font-bold">%</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 hover:bg-slate-50">
                <div>
                  <span className="font-bold text-slate-900 block">Official Examination</span>
                  <span className="text-[11px] text-slate-500">Terminal end-of-term main examination paper</span>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    className="w-20 h-8 text-center font-mono font-bold text-xs"
                    value={weights.examination}
                    onChange={(e) => handleWeightChange("examination", Number(e.target.value))}
                  />
                  <span className="text-slate-500 font-bold">%</span>
                </div>
              </div>
            </div>

            {/* Total Balance Row */}
            <div className={`p-3 px-4 flex justify-between items-center text-xs font-black border-t ${
              isValid100 ? "bg-emerald-50 text-emerald-900 border-emerald-200" : "bg-rose-50 text-rose-900 border-rose-200"
            }`}>
              <div className="flex items-center gap-2">
                {isValid100 ? (
                  <CheckCircle size={16} className="text-emerald-600" />
                ) : (
                  <AlertCircle size={16} className="text-rose-600" />
                )}
                <span>Total Accumulated Weight:</span>
              </div>
              <span className="font-mono text-sm">
                {totalWeight}% / 100% {isValid100 ? "(Balanced)" : `(${100 - totalWeight > 0 ? `+${Number(100 - totalWeight)}% Needed` : `${Number(totalWeight - 100)}% Exceeded`})`}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs font-semibold text-slate-600 gap-1.5"
              onClick={handleResetToStandard}
            >
              <RotateCcw size={13} /> Reset to Default (10/10/5/5/10/60)
            </Button>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
              >
                Close
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={!isValid100}
                className="bg-brand-600 hover:bg-brand-700 text-white font-bold gap-1.5"
              >
                <Save size={14} /> Save Weighting Structure
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
