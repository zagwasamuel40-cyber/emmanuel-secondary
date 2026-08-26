import re

with open("src/pages/Settings.tsx", "r") as f:
    content = f.read()

old_import = 'import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label } from "@/src/components/ui";'
new_import = 'import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label, Textarea } from "@/src/components/ui";'
content = content.replace(old_import, new_import)

old_block = """                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="aboutUsImageFile">About Us Page Image (Upload Image)</Label>"""

new_block = """                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="aboutUsText">About Us Page Text</Label>
                    <Textarea 
                      id="aboutUsText" 
                      rows={5}
                      value={portalSettings.aboutUsText || ""} 
                      onChange={(e) => setPortalSettings({aboutUsText: e.target.value})} 
                      placeholder="Founded with a vision to provide world-class education..."
                    />
                    <p className="text-xs text-slate-500 mt-1">This text will be displayed on the public About Us page.</p>
                  </div>
                  
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="aboutUsImageFile">About Us Page Image (Upload Image)</Label>"""

content = content.replace(old_block, new_block)

with open("src/pages/Settings.tsx", "w") as f:
    f.write(content)
