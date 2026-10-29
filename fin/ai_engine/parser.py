import pdfplumber
import docx
import re
import spacy
from spacy.matcher import PhraseMatcher

# Load NLP model
try:
    nlp = spacy.load("en_core_web_sm")
    matcher = PhraseMatcher(nlp.vocab, attr="LOWER")
    print("NLP Model and Matcher loaded successfully.")
except Exception as e:
    nlp = None
    matcher = None
    print(f"Failed to load NLP Model: {e}")

def clean_text(text):
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def extract_text_from_pdf(file_path):
    text = ""
    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text: text += page_text + "\n"
    except Exception as e: print(f"PDF Error: {e}")
    return clean_text(text)

def extract_text_from_docx(file_path):
    try:
        doc = docx.Document(file_path)
        return clean_text("\n".join([p.text for p in doc.paragraphs]))
    except: return ""

def get_skill_database():
    return {
        "Cloud & DevOps": [
            "AWS", "Amazon Web Services", "Azure", "GCP", "Google Cloud", "Docker", "Kubernetes", "K8s", 
            "Terraform", "Ansible", "Jenkins", "CircleCI", "Travis CI", "GitHub Actions", "GitLab CI", 
            "Prometheus", "Grafana", "ELK Stack", "Splunk", "CloudFormation", "Elastic Beanstalk", "Serverless",
            "Nginx", "Apache", "Vagrant", "Puppet", "Chef", "OpenStack", "Pulumi", "Datadog", "New Relic"
        ],
        "Frontend": [
            "React", "React.js", "ReactJS", "Vue", "Vue.js", "VueJS", "Angular", "AngularJS", "Next.js", "NextJS",
            "Nuxt.js", "Tailwind", "Tailwind CSS", "Bootstrap", "Sass", "LESS", "JavaScript", "JS", "TypeScript", "TS",
            "HTML", "HTML5", "CSS", "CSS3", "Redux", "Zustand", "Material UI", "MUI", "Chakra UI", "Vite", "Webpack",
            "Babel", "JQuery", "Svelte", "Bulma", "Ant Design", "Storybook", "Gatsby", "Recoil"
        ],
        "Backend": [
            "Node.js", "NodeJS", "Node", "Python", "FastAPI", "Flask", "Django", "Java", "Spring Boot", "Spring",
            "Go", "Golang", "Rust", "Ruby", "Ruby on Rails", "Rails", "PHP", "Laravel", "C#", ".NET", "ASP.NET",
            "C++", "C", "Scala", "Kotlin", "GraphQL", "REST API", "Microservices", "Express.js", "Express",
            "NestJS", "Fastify", "Elixir", "Clojure", "Koa", "AdonisJS"
        ],
        "Mobile": [
            "React Native", "Flutter", "Swift", "SwiftUI", "Objective-C", "Android", "iOS", "Kotlin Multiplatform",
            "Dart", "Ionic", "Cordova", "Xamarin", "Mobile Development", "Mobile App"
        ],
        "Database": [
            "PostgreSQL", "Postgres", "MySQL", "MariaDB", "MongoDB", "Redis", "SQL Server", "Oracle",
            "Cassandra", "DynamoDB", "SQLite", "SQL", "NoSQL", "DeepLake", "Pinecone", "ElasticSearch", "Prisma",
            "TypeORM", "Mongoose", "Sequelize", "Supabase", "Firebase", "Firestore", "CouchDB", "Neo4j"
        ],
        "AI/ML/Data": [
            "PyTorch", "TensorFlow", "Scikit-Learn", "Sklearn", "LLM", "NLP", "Machine Learning", "ML", 
            "Deep Learning", "DL", "Computer Vision", "CV", "LangChain", "OpenAI", "Hugging Face", "Pandas", 
            "NumPy", "Keras", "NLTK", "Spacy", "Transformers", "Data Science", "Data Analysis", "Matplotlib",
            "Seaborn", "Tableau", "Power BI", "Spark", "Hadoop", "Kafka"
        ],
        "Security & Tools": [
            "Pentesting", "Cybersecurity", "Ethical Hacking", "OAuth", "JWT", "Postman", "Git", "GitHub", 
            "Bitbucket", "Jira", "Confluence", "Trello", "Slack", "OAuth2", "SAML", "OpenID", "Auth0",
            "Kubectl", "Minikube", "Helm", "Sentry"
        ],
        "Soft Skills": [
            "Leadership", "Agile", "Scrum", "Communication", "Problem Solving", "Product Management",
            "Public Speaking", "Collaboration", "Teamwork", "Critical Thinking", "Adaptability", "Time Management",
            "Mentoring", "Strategic Planning", "Negotiation", "Conflict Resolution"
        ]
    }

def get_synonym_mapping():
    return {
        "Amazon Web Services": "AWS",
        "Google Cloud": "GCP",
        "Google Cloud Platform": "GCP",
        "K8s": "Kubernetes",
        "React.js": "React",
        "ReactJS": "React",
        "Vue.js": "Vue",
        "VueJS": "Vue",
        "NextJS": "Next.js",
        "JS": "JavaScript",
        "TS": "TypeScript",
        "CSS3": "CSS",
        "HTML5": "HTML",
        "NodeJS": "Node.js",
        "Node": "Node.js",
        "Golang": "Go",
        "Postgres": "PostgreSQL",
        "Sklearn": "Scikit-Learn",
        "Machine Learning": "ML",
        "Deep Learning": "DL",
        "Computer Vision": "CV",
        "JQuery": "jQuery",
        "Express": "Express.js",
        "Objective-C": "iOS",
        "SwiftUI": "iOS",
        "Firestore": "Firebase"
    }

# Pre-load patterns into matcher
if nlp and matcher:
    db = get_skill_database()
    for cat, skills in db.items():
        patterns = [nlp.make_doc(s) for s in skills]
        matcher.add(cat, patterns)

def extract_skills(text):
    if not text: return {"all": [], "categorized": {}}
    
    db = get_skill_database()
    synonyms = get_synonym_mapping()
    found = {}
    all_found_raw = []
    
    # helper to normalize skill names
    def normalize_name(name):
        return synonyms.get(name, name)

    # 1. NLP Matcher (Advanced)
    if nlp and matcher:
        try:
            doc = nlp(text)
            matches = matcher(doc)
            for match_id, start, end in matches:
                try:
                    rule_id = nlp.vocab.strings[match_id]
                except KeyError:
                    rule_id = "General"
                    
                span = doc[start:end].text
                normalized = normalize_name(span)
                
                if rule_id not in found: found[rule_id] = []
                if normalized.lower() not in [s.lower() for s in all_found_raw]:
                    # Format acronyms correctly
                    final_name = normalized if len(normalized) > 3 else normalized.upper()
                    found[rule_id].append(final_name)
                    all_found_raw.append(final_name)
        except Exception as e:
            print(f"NLP Matching error: {e}")
            
    # 2. Keyword Fallback (Zero-Failure)
    for cat, skills in db.items():
        for skill in skills:
            # Special case for skills that might not have traditional boundaries like C++ or .NET
            if any(char in skill for char in ['+', '#', '.', ' ']):
                # Use negative look-behind/ahead to ensure word boundaries without fixed-width issues
                pattern = r'(?i)(?<![a-zA-Z0-9])' + re.escape(skill) + r'(?![a-zA-Z0-9])'
            else:
                pattern = r'(?i)\b' + re.escape(skill) + r'\b'

            if re.search(pattern, text):
                normalized = normalize_name(skill)
                if normalized.lower() not in [s.lower() for s in all_found_raw]:
                    if cat not in found: found[cat] = []
                    # Format acronyms correctly
                    final_name = normalized if len(normalized) > 3 else normalized.upper()
                    found[cat].append(final_name)
                    all_found_raw.append(final_name)
                    
    print(f"Extraction complete. Skills found: {len(all_found_raw)}")
    return {
        "all": list(set(all_found_raw)),
        "categorized": found
    }

def extract_experience(text):
    # Advanced pattern for ranges and "+" signs
    patterns = [
        r'(\d+)\s*\-\s*(\d+)\s*years?',
        r'(\d+)\+?\s*years?',
        r'experience\s*of\s*(\d+)'
    ]
    for p in patterns:
        match = re.search(p, text, re.I)
        if match:
            # If it's a range like 3-5, take the higher number
            if len(match.groups()) > 1: return int(match.groups()[1])
            return int(match.groups()[0])
    return 0

def extract_projects(text):
    """Semi-semantic project extraction using section headers and bullets."""
    projects = []
    # Identify popular project section headers
    project_headers = [r'PROJECTS', r'ACADEMIC PROJECTS', r'PERSONAL PROJECTS', r'TECHNICAL PROJECTS']
    pattern = "|".join(project_headers)
    
    sections = re.split(pattern, text, flags=re.IGNORECASE)
    if len(sections) > 1:
        project_text = sections[1]
        # Look for bullet points or common separators
        lines = [line.strip() for line in project_text.split('\n') if line.strip()]
        current_project = ""
        for line in lines:
            # If line is short and doesn't start with bullet, it might be a title
            if len(line) < 60 and not line.startswith(('-', '*', '•')):
                if current_project: projects.append(current_project)
                current_project = line
            else:
                current_project += " " + line
            
            # Limit to top 5 projects
            if len(projects) >= 5: break
        if current_project and len(projects) < 5: projects.append(current_project)
        
    return projects

def extract_education(text):
    """Extract education details (Degree, Institution)."""
    edu_list = []
    # Common degree patterns
    degree_patterns = [
        r"(B\.E|B\.Tech|M\.Tech|BCA|MCA|MS|B\.Sc|M\.Sc|Degree|Bachelor|Master)[^.\n,]*",
    ]
    for p in degree_patterns:
        matches = re.finditer(p, text, re.I)
        for m in matches:
            edu_list.append(m.group(0).strip())
    return list(set(edu_list[:2])) # Return top 2

def parse_resume(file_path):
    text = extract_text_from_pdf(file_path) if file_path.endswith('.pdf') else extract_text_from_docx(file_path)
    skill_data = extract_skills(text)
    
    return {
        "text": text,
        "skills": skill_data["all"],
        "categorized_skills": skill_data["categorized"],
        "experience_years": extract_experience(text),
        "projects": extract_projects(text),
        "education_details": extract_education(text)
    }
