import re

with open("src/pages/public/Admissions.tsx", "r") as f:
    content = f.read()

old_buttons = """        <div className="flex gap-4 mt-8 justify-center">
          <Button variant="outline" onClick={() => window.print()} className="gap-2">
            Print Application Slip
          </Button>
          <Button variant="brand" onClick={() => {
            setSubmitted(false);"""

new_buttons = """        <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
          <Button variant="outline" onClick={() => window.print()} className="gap-2">
            Print Application Slip
          </Button>
          <Link to="/admission-status">
            <Button variant="outline" className="gap-2 border-brand-200 text-brand-700 bg-brand-50 w-full sm:w-auto">
              <Search size={16} /> Check Admission Status
            </Button>
          </Link>
          <Button variant="brand" onClick={() => {
            setSubmitted(false);"""
content = content.replace(old_buttons, new_buttons)

with open("src/pages/public/Admissions.tsx", "w") as f:
    f.write(content)
