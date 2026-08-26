import re

with open("src/pages/student/StudentSubjects.tsx", "r") as f:
    content = f.read()

imports = """
import { useAssignments } from "../../data/assignmentsData";
"""

if "import { useAssignments }" not in content:
    content = content.replace(
        'import { BookOpen, Clock, Download, PlayCircle, Edit3, CheckCircle2, Award, FileText, UploadCloud, X, AlertTriangle, Lock } from "lucide-react";',
        'import { BookOpen, Clock, Download, PlayCircle, Edit3, CheckCircle2, Award, FileText, UploadCloud, X, AlertTriangle, Lock } from "lucide-react";\n' + imports
    )

state_vars = """
  const { assignments, submissions, setSubmissions } = useAssignments();
  const [submissionText, setSubmissionText] = useState("");
  const [activeSubmittingAss, setActiveSubmittingAss] = useState<string | null>(null);

  const handleTextSubmit = (assId: string) => {
    if (!submissionText) return;
    const newSub = {
      id: `SUB-${Math.floor(1000 + Math.random() * 9000)}`,
      assignmentId: assId,
      studentId: currentStudent?.id || "ESS/2026/001",
      studentName: currentStudent?.name || "Student",
      content: submissionText,
      submittedAt: new Date().toLocaleString(),
      grade: null,
      feedback: "",
      status: "Pending Review" as const
    };
    setSubmissions([newSub, ...submissions]);
    setSubmissionText("");
    setActiveSubmittingAss(null);
  };
"""

if "const { assignments" not in content:
    content = content.replace(
        "const [activeTab, setActiveTab] = useState(\"subjects\");",
        "const [activeTab, setActiveTab] = useState(\"subjects\");\n" + state_vars
    )

with open("src/pages/student/StudentSubjects.tsx", "w") as f:
    f.write(content)
