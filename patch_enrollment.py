import re

with open('src/pages/Enrollment.tsx', 'r') as f:
    content = f.read()

# Remove the admission applications button
button_pattern = r'<Button[^>]*?variant=\{activeTab === "admission_applications".*?Admission Applications\s*</Button>'
content = re.sub(button_pattern, '', content, flags=re.DOTALL)

# Remove the admission applications view
view_pattern = r'\{activeTab === "admission_applications" && \(.*?</Card>\s*\)\}'
content = re.sub(view_pattern, '', content, flags=re.DOTALL)

with open('src/pages/Enrollment.tsx', 'w') as f:
    f.write(content)
