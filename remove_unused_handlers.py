import re

with open('src/pages/Examinations.tsx', 'r') as f:
    content = f.read()

handlers_to_remove = [
    'handleValidateExam',
    'handleAddScoreToAnnual',
    'handleDeleteSubjectRecorded',
    'handleDeleteSingleSubjectRecorded',
    'handleDeleteAnnualPerSubjectClass',
    'handleDeleteSingleAnnualPerSubjectStudent',
]

# We need to remove the block from `const handler = () => {` to the matching `};`
def remove_function(content, func_name):
    # Find start of function
    match = re.search(r'const ' + func_name + r' = .*?\{', content)
    if not match:
        return content
    
    start_idx = match.start()
    
    # Find matching closing brace
    brace_count = 0
    in_string = False
    string_char = ''
    i = start_idx
    
    while i < len(content):
        if content[i] == '{' and not in_string:
            brace_count += 1
        elif content[i] == '}' and not in_string:
            brace_count -= 1
            if brace_count == 0:
                end_idx = i + 1
                
                # Check for trailing semicolon
                while end_idx < len(content) and content[end_idx] in [' ', '\t', '\n', ';']:
                    if content[end_idx] == ';':
                        end_idx += 1
                        break
                    end_idx += 1
                    
                return content[:start_idx] + content[end_idx:]
        
        elif content[i] in ['"', "'", '`']:
            if not in_string:
                in_string = True
                string_char = content[i]
            elif in_string and content[i] == string_char:
                if content[i-1] != '\\':
                    in_string = False
                    
        i += 1
        
    return content

for handler in handlers_to_remove:
    content = remove_function(content, handler)

with open('src/pages/Examinations.tsx', 'w') as f:
    f.write(content)

