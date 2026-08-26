import re

with open("src/pages/StudentPortalManager.tsx", "r") as f:
    content = f.read()

imports = 'import { useComments } from "../data/commentsData";\nimport { Star, MessageCircle, ThumbsUp, ThumbsDown } from "lucide-react";'
if "useComments" not in content:
    content = content.replace(
        'import { FileText, Upload } from "lucide-react";',
        'import { FileText, Upload } from "lucide-react";\n' + imports
    )

if 'useState<"news" | "branding" | "features">' in content:
    content = content.replace(
        'useState<"news" | "branding" | "features">',
        'useState<"news" | "branding" | "features" | "comments">'
    )

if 'const [features, setFeatures]' in content and 'const [comments, setComments] = useComments();' not in content:
    content = content.replace(
        '  const [features, setFeatures] = useState([',
        '  const [comments, setComments] = useComments();\n  const [features, setFeatures] = useState(['
    )

# Add Tab Button
tab_button = """        <button
          onClick={() => setActiveTab("comments")}
          className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 text-sm font-semibold rounded-lg transition-colors ${
            activeTab === 'comments' ? 'bg-purple-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MessageCircle size={18} />
          Parent Reviews
        </button>
      </div>"""

if 'Parent Reviews' not in content:
    content = content.replace(
        '        </button>\n      </div>',
        '        </button>\n' + tab_button
    )

# Add Tab Content
tab_content = """
      {activeTab === "comments" && (
        <Card className="border border-slate-200">
          <CardHeader className="bg-slate-50/50 border-b border-slate-200 pb-4">
            <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MessageCircle className="text-purple-600" size={20} /> Parent Testimonials & Reviews
            </CardTitle>
            <p className="text-sm text-slate-500 mt-1">Approve or reject parent comments before they appear on the public homepage.</p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {comments.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No parent comments received yet.</div>
              ) : (
                comments.map(comment => (
                  <div key={comment.id} className="p-6 flex flex-col md:flex-row gap-6 hover:bg-slate-50 transition-colors">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold">
                          {comment.parentName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">{comment.parentName}</h4>
                          <p className="text-xs text-slate-500">{comment.relation} &bull; {comment.date}</p>
                        </div>
                        <span className={`ml-auto px-3 py-1 rounded-full text-xs font-bold ${
                          comment.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                          comment.status === 'Rejected' ? 'bg-rose-100 text-rose-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {comment.status}
                        </span>
                      </div>
                      <p className="text-slate-700 text-sm p-4 bg-white border border-slate-200 rounded-xl">
                        "{comment.comment}"
                      </p>
                    </div>
                    
                    <div className="flex flex-row md:flex-col items-center justify-center gap-2 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6 min-w-[140px]">
                      {comment.status !== 'Approved' && (
                        <Button 
                          variant="brand" 
                          size="sm" 
                          className="w-full bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center gap-2"
                          onClick={() => {
                            setComments(comments.map(c => c.id === comment.id ? { ...c, status: "Approved" } : c));
                            setToastMsg("Comment approved successfully!");
                            setTimeout(() => setToastMsg(""), 3000);
                          }}
                        >
                          <ThumbsUp size={14} /> Approve
                        </Button>
                      )}
                      {comment.status !== 'Rejected' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full text-rose-600 hover:bg-rose-50 hover:text-rose-700 border-rose-200 flex items-center justify-center gap-2"
                          onClick={() => {
                            setComments(comments.map(c => c.id === comment.id ? { ...c, status: "Rejected" } : c));
                            setToastMsg("Comment rejected.");
                            setTimeout(() => setToastMsg(""), 3000);
                          }}
                        >
                          <ThumbsDown size={14} /> Reject
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full text-slate-500 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center gap-2"
                        onClick={() => {
                          if (window.confirm("Are you sure you want to permanently delete this comment?")) {
                            setComments(comments.filter(c => c.id !== comment.id));
                            setToastMsg("Comment deleted.");
                            setTimeout(() => setToastMsg(""), 3000);
                          }
                        }}
                      >
                        <Trash2 size={14} /> Delete
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
"""

if "Parent Testimonials & Reviews" not in content:
    content = content.replace(
        '    </div>\n  );\n}',
        tab_content + '\n    </div>\n  );\n}'
    )

with open("src/pages/StudentPortalManager.tsx", "w") as f:
    f.write(content)
