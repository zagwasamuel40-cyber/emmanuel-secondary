import re

with open("src/pages/Students.tsx", "r") as f:
    content = f.read()

# Add import
if "HeadTeacherComments" not in content:
    content = content.replace(
        'import StudentSkills from "./students/StudentSkills";',
        'import StudentSkills from "./students/StudentSkills";\nimport HeadTeacherComments from "./students/HeadTeacherComments";'
    )

# Add sidebar button
if "Head Teacher" not in content:
    button_html = """          <Button 
            variant={activeTab === "comments" ? "brand" : "outline"} 
            className={`justify-start gap-3 w-full ${activeTab !== "comments" ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700' : ''}`}
            onClick={() => setActiveTab("comments")}
          >
            <FileText size={18} /> Head Teacher's Comments
          </Button>"""
    
    content = content.replace(
        '          </Button>\n        </div>\n        {/* Main Content Area */}',
        '          </Button>\n' + button_html + '\n        </div>\n        {/* Main Content Area */}'
    )

# Add component render
if "HeadTeacherComments students={students}" not in content:
    content = content.replace(
        '{activeTab === "skills" && <StudentSkills students={students} />}',
        '{activeTab === "skills" && <StudentSkills students={students} />}\n          {activeTab === "comments" && <HeadTeacherComments students={students} />}'
    )

with open("src/pages/Students.tsx", "w") as f:
    f.write(content)
