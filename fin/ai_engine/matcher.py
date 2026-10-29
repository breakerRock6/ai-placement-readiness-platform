from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# Simulate Market Trends for 2026
TRENDING_BOOSTS = {
    "AI/ML": 1.25,
    "Cloud & DevOps": 1.15,
    "Frontend": 1.0,
    "Backend": 1.05
}

def calculate_match(resume_data, job_data):
    """
    resume_data: {text, skills, categorized_skills, experience_years, projects}
    job_data: {text, required_skills, core_skills}
    """
    resume_text = resume_data.get('text', '')
    resume_skills = set([s.lower() for s in resume_data.get('skills', [])])
    resume_projects = resume_data.get('projects', [])
    
    if isinstance(job_data, dict):
        job_text = job_data.get('text', '')
        # Professional Tier: Distinguish Core vs Secondary skills
        job_skills = set([s.lower() for s in job_data.get('required_skills', [])])
        core_skills = set([s.lower() for s in job_data.get('core_skills', ["python", "react", "node.js", "aws", "docker", "c++", "java", "sql", "git"])]) 
    else:
        job_text = job_data
        job_skills = set()
        core_skills = set(["python", "react", "node.js", "aws", "docker"])

    # 1. CORE TECHNICAL ALIGNMENT (40%)
    matched_core = resume_skills.intersection(core_skills)
    core_score = (len(matched_core) / len(core_skills) * 100) if core_skills else 100
    
    # 2. BREADTH OF SECONDARY SKILLS (15%)
    secondary_job_skills = job_skills.difference(core_skills)
    matched_secondary = resume_skills.intersection(secondary_job_skills)
    secondary_score = (len(matched_secondary) / len(secondary_job_skills) * 100) if secondary_job_skills else 80

    # 3. PROJECT CONTEXT & SEMANTIC MATCH (25%)
    # Comparing project descriptions directly to job text
    project_text = " ".join(resume_projects)
    try:
        if project_text.strip() and job_text.strip():
            vectorizer = TfidfVectorizer(stop_words='english')
            tfidf = vectorizer.fit_transform([project_text, job_text])
            project_match_score = cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0] * 100
        else:
            project_match_score = 0
            
        # Overall semantic match (resume + projects vs job)
        combined_resume = resume_text + " " + project_text
        tfidf_full = vectorizer.fit_transform([combined_resume, job_text])
        semantic_score = cosine_similarity(tfidf_full[0:1], tfidf_full[1:2])[0][0] * 100
    except:
        project_match_score = semantic_score = 0

    # 4. EXPERIENCE & TREND DEPTH (20%)
    exp_years = resume_data.get('experience_years', 0)
    exp_score = min(exp_years / 5, 1.0) * 100 # Professional benchmark is 5 years
    
    trend_boost = 1.0
    cat_skills = resume_data.get('categorized_skills', {})
    for cat, boost in TRENDING_BOOSTS.items():
        if cat in cat_skills and len(cat_skills[cat]) > 0:
            trend_boost = max(trend_boost, boost)
    
    # FINAL WEIGHTED PRS
    # Professional Base: 10% (for having a valid structured profile)
    prs_score = 10 + (core_score * 0.35) + (secondary_score * 0.15) + (project_match_score * 0.15) + (semantic_score * 0.10) + (exp_score * 0.15)
    prs_score *= trend_boost 
    prs_score = min(prs_score, 100) 

    return {
        "prs": float(round(prs_score, 1)),
        "is_elite": bool(prs_score >= 88.0),
        "breakdown": {
            "core_tech": float(round(core_score, 1)),
            "secondary_match": float(round(secondary_score, 1)),
            "project_relevance": float(round(project_match_score, 1)),
            "semantic_depth": float(round(semantic_score, 1)),
            "exp_seniority": float(round(exp_score, 1))
        },
        "matched": list(resume_skills.intersection(job_skills)),
        "gaps": {
            "critical": [s.title() for s in core_skills if s not in resume_skills],
            "upskilling_paths": [s.title() for s in secondary_job_skills if s not in resume_skills]
        }
    }

def generate_explanation(result):
    score = result['prs']
    b = result['breakdown']
    status = "Elite Candidate" if result['is_elite'] else "Professional Rank" if score >= 70 else "Developing Talent"
    
    xai_report = f"Candidate Status: {status} ({score}%). "
    xai_report += f"Technical core match is {b['core_tech']}%, with {b['project_relevance']}% alignment in project context. "
    xai_report += f"Experience depth and market trend alignment contributed {b['exp_seniority']}% to final rank. "
    
    if result['is_elite']:
        xai_report += "Verdict: This candidate demonstrates exceptional mastery across all professional benchmarks."
    elif result['gaps']['critical']:
        xai_report += f"Next Steps: Focus on mastering core tech: {', '.join(result['gaps']['critical'][:2])}."
        
    return xai_report
