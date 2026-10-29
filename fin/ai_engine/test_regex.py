
import re

def test_regex():
    text = "Expert in C++ and C# with .NET background."
    skills = ["C++", "C#", ".NET", "Python"]
    
    for s in skills:
        # The current pattern in parser.py
        if any(char in s for char in ['+', '#', '.', ' ']):
            pattern = r'(?i)(?<![a-zA-Z0-9])' + re.escape(s) + r'(?![a-zA-Z0-9])'
        else:
            pattern = r'(?i)\b' + re.escape(s) + r'\b'
        
        match = re.search(pattern, text)
        print(f"Skill: {s:10} Match: {'YES' if match else 'NO'}  Pattern: {pattern}")

if __name__ == "__main__":
    test_regex()
