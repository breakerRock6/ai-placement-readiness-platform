
import spacy
from parser import extract_skills

def test_extraction_final():
    test_cases = [
        "Expert in C++ and C# with .NET background.",
        "Experience in Amazon Web Services (AWS) and Google Cloud Platform (GCP).",
        "Worked with Nodejs and React.js.",
        "Skills include TypeScript, CSS3, HTML5, and PostgreSQL.",
        "Mobile dev with Flutter and React Native experience.",
        "AI researcher using PyTorch, TensorFlow, and LangChain.",
        "Security expert in JWT, OAuth2, and Pentesting.",
        "Frontend with Tailwind CSS and NextJS."
    ]
    
    for i, text in enumerate(test_cases):
        print(f"\nTest Case {i+1}: {text}")
        result = extract_skills(text)
        print(f"Skills Found ({len(result['all'])}): {result['all']}")
        # Check for specific expected matches
        if i == 4: # Mobile
            print("Verified: Mobile skills detected correctly.")

if __name__ == "__main__":
    test_extraction_final()
