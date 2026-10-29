import pdfplumber
import os

pdf_files = [
    "Skill_Recommendation_System_and_Resume_Analysis_using_AI.pdf",
    "AI-Powered_Model_for_Intelligent_Resume_Recommendation_and_Feedback.pdf",
    "AI-Driven_Intelligent_System_for_Personalized_Job_Recommendations_Using_Real-Time_Skill_Identification_and_Industry_Trend_Analysis.pdf",
    "Optimizing_Job_Matching_Through_Automated_Resume_Screening_with_NLP_and_Machine_Learning.pdf",
    "Resume_Analysis_and_Job_Recommendation.pdf"
]

base_dir = "d:\\fin"

with open("extracted_papers.txt", "w", encoding="utf-8") as f:
    for pdf_file in pdf_files:
        path = os.path.join(base_dir, pdf_file)
        f.write(f"\n--- PROCESSING: {pdf_file} ---\n")
        print(f"Processing {pdf_file}...")
        try:
            with pdfplumber.open(path) as pdf:
                text = ""
                # Extract up to 3 pages to capture enough context
                for i, page in enumerate(pdf.pages):
                    if i < 3 or i == len(pdf.pages) - 1:
                        extracted = page.extract_text()
                        if extracted:
                            text += extracted + "\n"
                
                f.write(text[:8000]) 
                f.write("\n--- END OF EXTRACT ---\n")
        except Exception as e:
            f.write(f"Error reading {pdf_file}: {e}\n")
            print(f"Error: {e}")
