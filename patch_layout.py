import re

with open("src/layouts/PublicLayout.tsx", "r") as f:
    content = f.read()

# Add link in header navigation
old_nav = """            <Link to="/entrance-exam" className="hover:text-brand-600 transition-colors">Entrance Exam</Link>
            <Link to="/news" className="hover:text-brand-600 transition-colors">News</Link>"""
new_nav = """            <Link to="/entrance-exam" className="hover:text-brand-600 transition-colors">Entrance Exam</Link>
            <Link to="/admission-status" className="hover:text-brand-600 transition-colors">Check Status</Link>
            <Link to="/news" className="hover:text-brand-600 transition-colors">News</Link>"""
content = content.replace(old_nav, new_nav)

# Add link in footer
old_footer = """              <li><Link to="/entrance-exam" className="hover:text-brand-500">Entrance Exam Registration</Link></li>"""
new_footer = """              <li><Link to="/entrance-exam" className="hover:text-brand-500">Entrance Exam Registration</Link></li>
              <li><Link to="/admission-status" className="hover:text-brand-500">Check Admission Status</Link></li>"""
content = content.replace(old_footer, new_footer)

with open("src/layouts/PublicLayout.tsx", "w") as f:
    f.write(content)
