import React, { useState } from "react";
import { useComments } from "../data/commentsData";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label } from "@/src/components/ui";
import { CheckCircle2, MessageSquare } from "lucide-react";

export function ParentCommentForm() {
  const [comments, setComments] = useComments();
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("");
  const [commentText, setCommentText] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !relation || !commentText) return;

    const newComment = {
      id: `COM-${Math.floor(1000 + Math.random() * 9000)}`,
      parentName: name,
      relation: relation,
      comment: commentText,
      date: new Date().toISOString().split('T')[0],
      status: "Pending" as const
    };

    setComments([newComment, ...comments]);
    setName("");
    setRelation("");
    setCommentText("");
    setSuccess(true);
    setTimeout(() => setSuccess(false), 5000);
  };

  if (success) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 p-8 rounded-2xl text-center flex flex-col items-center">
        <CheckCircle2 size={48} className="text-emerald-500 mb-4" />
        <h3 className="text-xl font-bold text-emerald-900 mb-2">Comment Submitted</h3>
        <p className="text-emerald-700">Thank you! Your comment has been submitted and is awaiting approval by the portal admin.</p>
      </div>
    );
  }

  return (
    <Card className="bg-white border-slate-200 shadow-sm">
      <CardHeader className="bg-slate-50 border-b border-slate-100 rounded-t-xl">
        <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
          <MessageSquare size={20} className="text-brand-500" />
          Leave a Review
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Your Name</Label>
              <Input required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Mr. John Doe" />
            </div>
            <div className="space-y-1.5">
              <Label>Relation / Title</Label>
              <Input required value={relation} onChange={e => setRelation(e.target.value)} placeholder="e.g. Parent of JSS 1 Student" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Your Comment</Label>
            <textarea 
              required 
              value={commentText} 
              onChange={e => setCommentText(e.target.value)} 
              className="w-full h-24 p-3 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-brand-500 outline-none resize-none" 
              placeholder="Share your experience with the school..." 
            />
          </div>
          <Button type="submit" variant="brand" className="w-full">
            Submit for Approval
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
