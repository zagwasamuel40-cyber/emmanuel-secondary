import re

with open("src/pages/Home.tsx", "r") as f:
    content = f.read()

imports = """import { useComments } from "../data/commentsData";
import { ParentCommentForm } from "../components/ParentCommentForm";
import { MessageSquare, Star } from "lucide-react";"""

if "import { useComments }" not in content:
    content = content.replace('import { usePortalSettings } from "../data/portalSettingsData";', 'import { usePortalSettings } from "../data/portalSettingsData";\n' + imports)

# We need to add the section inside the Home component
# `export default function Home() {`
# `const [comments] = useComments();`
# `const approvedComments = comments.filter(c => c.status === "Approved");`

if "const [comments] = useComments();" not in content:
    content = content.replace(
        "const [portalSettings] = usePortalSettings();",
        "const [portalSettings] = usePortalSettings();\n  const [comments] = useComments();\n  const approvedComments = comments.filter(c => c.status === \"Approved\");"
    )

testimonials_section = """
      {/* Testimonials Section */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl font-bold text-slate-900 mb-4">What Parents Are Saying</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Hear from our community of parents and guardians about their experience with {portalSettings.schoolName}.</p>
          </div>
          
          {approvedComments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {approvedComments.slice(0, 3).map(comment => (
                <Card key={comment.id} className="border-0 shadow-lg shadow-slate-200/50 bg-white">
                  <CardContent className="p-8">
                    <div className="flex text-amber-400 mb-4">
                      {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="currentColor" />)}
                    </div>
                    <p className="text-slate-700 italic mb-6">"{comment.comment}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold">
                        {comment.parentName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{comment.parentName}</h4>
                        <p className="text-xs text-slate-500">{comment.relation}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 bg-white rounded-2xl border border-slate-200 mb-16">
              No comments available yet. Be the first to share your experience!
            </div>
          )}

          <div className="max-w-2xl mx-auto">
            <ParentCommentForm />
          </div>
        </div>
      </section>
"""

# Insert before Contact Section
if "Testimonials Section" not in content:
    content = content.replace(
        "{/* Contact & Inquiries Section */}",
        testimonials_section + "\n      {/* Contact & Inquiries Section */}"
    )

with open("src/pages/Home.tsx", "w") as f:
    f.write(content)
