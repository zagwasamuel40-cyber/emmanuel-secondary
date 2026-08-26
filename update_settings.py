import re

with open("src/data/portalSettingsData.ts", "r") as f:
    content = f.read()

content = content.replace(
    'schoolName: "Emmanuel Secondary School"',
    'schoolName: "EMMANUEL SECONDARY SCHOOL, MAKURDI"'
)
content = content.replace(
    'address: "Km 4, Gboko Road, Makurdi, Benue State"',
    'address: "Behind Federal Low Cost, Naka Road, Makurdi Benue State."'
)
content = content.replace(
    'contactPhone: "+234 803 123 4567"',
    'contactPhone: "07039009964 or 07065166377"'
)
content = content.replace(
    'principalName: "Mr. J. T. Terna"',
    'principalName: "IORTYER EMMANUEL"'
)
# Add site
if 'website: "https://emmanuelschoolsmkd.com/"' not in content:
    content = content.replace(
        '  contactEmail: string;',
        '  contactEmail: string;\n  website: string;'
    )
    content = content.replace(
        '  contactEmail: "info@ess.edu.ng",',
        '  contactEmail: "info@ess.edu.ng",\n  website: "https://emmanuelschoolsmkd.com/",'
    )

with open("src/data/portalSettingsData.ts", "w") as f:
    f.write(content)
