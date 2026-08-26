import re

with open("src/pages/AdmissionsManagement.tsx", "r") as f:
    content = f.read()

# I need to change `        </Card>\n      )` to `        </Card>\n      )}`
# And `        </Card>\n        </div>\n      )` to `        </Card>\n        </div>\n      )}`

content = content.replace("        </Card>\n      )", "        </Card>\n      )}")
content = content.replace("        </Card>\n        </div>\n      )", "        </Card>\n        </div>\n      )}")

with open("src/pages/AdmissionsManagement.tsx", "w") as f:
    f.write(content)
