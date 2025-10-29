#!/usr/bin/env python3
"""
Quick script to fix the indentation issue in main.py
Run this to fix the /api/analyze endpoint indentation
"""

# Read the file
with open('main.py', 'r') as f:
    lines = f.readlines()

# Fix line 181 if it's not indented
if len(lines) > 180 and lines[180].startswith('posts_df['):
    lines[180] = '        ' + lines[180].lstrip()
    print("Fixed line 181")

# Fix line 203 if it's not indented  
if len(lines) > 202 and lines[202].startswith('for label'):
    lines[202] = '        ' + lines[202].lstrip()
    print("Fixed line 203")

# Fix line 220 if it's not indented
if len(lines) > 219 and lines[219].startswith('grouped_data'):
    lines[219] = '        ' + lines[219].lstrip()
    print("Fixed line 220")

# Fix line 221 if it's not indented
if len(lines) > 220 and lines[220].startswith('for i in range'):
    lines[220] = '        ' + lines[220].lstrip()
    print("Fixed line 221")

# Write back
with open('main.py', 'w') as f:
    f.writelines(lines)

print("✅ Indentation fixed! Run: python3 -m py_compile main.py")

