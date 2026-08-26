import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@/src/components/ui";
import { Upload, CheckCircle2 } from "lucide-react";

export default function UploadStudents() {
  const [successMsg, setSuccessMsg] = useState("");

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("File uploaded successfully. Processing background jobs to enroll students.");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {successMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg flex items-center gap-3">
          <CheckCircle2 className="text-emerald-500" size={20} />
          <p className="font-medium text-sm">{successMsg}</p>
        </div>
      )}

      <Card className="border-0 shadow-sm max-w-2xl">
        <CardHeader className="bg-slate-900 text-white rounded-t-xl">
          <CardTitle className="text-lg flex items-center gap-2">
            <Upload size={20} className="text-brand-400" />
            Upload Admitted Students
          </CardTitle>
          <p className="text-slate-400 text-xs mt-1">Batch upload students using a CSV or Excel template.</p>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleUpload} className="space-y-6">
            <div className="p-4 bg-brand-50 text-brand-800 border border-brand-200 rounded-lg text-sm flex justify-between items-center">
              <div>
                <p className="font-semibold">Step 1: Download Template</p>
                <p className="text-brand-700/80 mt-1">Ensure your data matches the required column format.</p>
              </div>
              <Button type="button" variant="outline" className="bg-white">Download CSV Template</Button>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Step 2: Upload Completed File</label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-10 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                <Upload size={36} className="text-brand-500 mb-3" />
                <p className="font-medium text-slate-700">Click to select file or drag and drop</p>
                <p className="text-xs text-slate-500 mt-1">Supports .csv, .xlsx, .xls</p>
              </div>
            </div>
            <Button type="submit" variant="brand" className="w-full gap-2">
              <Upload size={16} /> Process Upload
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
