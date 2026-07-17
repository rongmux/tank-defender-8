import re, os

root = r"D:\Documents\New project"
with open(os.path.join(root, 'src/game.js'), 'r', encoding='utf-8') as f:
    content = f.read()
lines = content.split('\n')

# Find all deps aliases
deps_vars = {}
for i, line in enumerate(lines):
    m = re.match(r'^\s+var (\w+) = deps\.(\w+);?\s*$', line)
    if m:
        deps_vars[m.group(1)] = i

# Find all local function definitions
local_funcs = {}
for i, line in enumerate(lines):
    m = re.match(r'^\s+function (\w+)\(', line)
    if m:
        local_funcs[m.group(1)] = i

# Find conflicts where deps alias is BEFORE local function
# (so the var assignment overrides the hoisted function)
conflicts = []
for name in deps_vars:
    if name in local_funcs:
        deps_line = deps_vars[name]
        func_line = local_funcs[name]
        # var declaration happens at its line, function is hoisted
        # If var line is before function line, var MAY override function
        # Actually both are in the same scope:
        # function declarations are hoisted above var declarations
        # BUT var assignments happen at their position
        # So: function is hoisted first, then var assignment overrides it
        if deps_line < func_line:
            conflicts.append((name, deps_line, func_line, 'var OVERRIDES function'))

for c in sorted(conflicts):
    print(f'{c[0]}: deps at line {c[1]+1}, local func at line {c[2]+1} — {c[3]}')
print(f'\nTotal conflicts: {len(conflicts)}')
