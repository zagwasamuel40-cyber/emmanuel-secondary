import re

def update_file(filepath, replacements):
    with open(filepath, "r") as f:
        content = f.read()

    import_statement = 'import { usePortalSettings } from "../../data/portalSettingsData";\n'
    
    if 'usePortalSettings' not in content:
        # Find a good place to put it
        content = content.replace('import { Button', import_statement + 'import { Button')
    
    if 'const [portalSettings] = usePortalSettings();' not in content:
        content = re.sub(r'(export default function [A-Za-z0-9_]+\(\) {)', r'\1\n  const [portalSettings] = usePortalSettings();', content)

    for old, new in replacements.items():
        content = content.replace(old, new)
        
    with open(filepath, "w") as f:
        f.write(content)


update_file("src/pages/public/EntranceExam.tsx", {
    'Take the admission CBT entrance exam to qualify for admission into Emmanuel Secondary School.': 'Take the admission CBT entrance exam to qualify for admission into {portalSettings.schoolName}.',
    '"You have passed the admission standard for Emmanuel Secondary School."': '`You have passed the admission standard for ${portalSettings.schoolName}.`'
})

update_file("src/pages/public/About.tsx", {
    'About Emmanuel Secondary School': 'About {portalSettings.schoolName}'
})

update_file("src/pages/public/News.tsx", {
    'Stay updated with official announcements, news, and academic events at Emmanuel Secondary School.': 'Stay updated with official announcements, news, and academic events at {portalSettings.schoolName}.'
})

update_file("src/pages/Login.tsx", {
    'Emmanuel Secondary School Management System': '{portalSettings.schoolName} Management System'
})

# Login might not have usePortalSettings, let's check it separately.
