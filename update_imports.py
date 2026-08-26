import re

def ensure_import_and_hook(filepath, component_name):
    with open(filepath, "r") as f:
        content = f.read()

    import_statement = 'import { usePortalSettings } from "../data/portalSettingsData";\n'
    if 'pages/public' in filepath:
        import_statement = 'import { usePortalSettings } from "../../data/portalSettingsData";\n'

    if 'usePortalSettings' not in content:
        content = re.sub(r'import ', import_statement + 'import ', content, 1)
    
    if 'const [portalSettings] = usePortalSettings();' not in content:
        # Find the function definition
        content = re.sub(rf'(export default function {component_name}\(\) {{)', rf'\1\n  const [portalSettings] = usePortalSettings();', content)
        
    with open(filepath, "w") as f:
        f.write(content)

ensure_import_and_hook("src/pages/public/About.tsx", "About")
ensure_import_and_hook("src/pages/public/News.tsx", "News")
ensure_import_and_hook("src/pages/public/ResultChecker.tsx", "ResultChecker")

