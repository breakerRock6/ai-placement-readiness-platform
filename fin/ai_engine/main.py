from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
import uvicorn
import os
import shutil
import httpx
from ddgs import DDGS

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from parser import parse_resume
from matcher import calculate_match, generate_explanation

# --- Knowledge Base & Chat Logic ---
KNOWLEDGE_BASE = {
    "react": "React is a leading JS library for building UIs. In 2026, React Server Components (RSC) and the Compiler are standard.",
    "python": "Python is the king of AI/Data Science and automation. Also popular for backends with FastAPI and Django.",
    "ats": "ATS systems screen resumes for keywords. Aim for a score of 85+ by tailoring your resume to the job description.",
    "market": "Job Market 2026: High demand for AI Engineers and Full Stack devs with cloud expertise.",
}

@app.get("/")
def read_root():
    return {"message": "AI Engine is running"}

@app.post("/chat")
async def chat_endpoint(data: dict):
    user_message = data.get("message", "").lower()
    context = data.get("context", {})
    resume_score = context.get("resumeScore", None)
    
    trace = []
    
    if "ats" in user_message or "score" in user_message:
        if resume_score:
            return {"reply": f"Your ATS Score is {resume_score}. Optimize keywords to reach 85+!", "reasoning": "Intent: Score Inquiry"}
        return {"reply": "Upload your resume in the Dashboard to get a score.", "reasoning": "No context found"}

    for key, answer in KNOWLEDGE_BASE.items():
        if key in user_message:
            return {"reply": answer, "reasoning": f"KB Match: {key}"}
            
    try:
        results = DDGS().text(user_message, max_results=3)
        if results:
            summary = "\n\n".join([f"**{r['title']}**\n{r['body']}\n[Source]({r['href']})" for r in results])
            return {"reply": summary, "reasoning": "Web Search successful"}
    except Exception as e:
        pass

    return {"reply": "I couldn't find an answer. Try rephrasing.", "reasoning": "Fallback reached"}

@app.get("/browser/search", response_class=HTMLResponse)
async def browser_search(q: str = Query(None)):
    if not q:
        return """
        <html><body style="background:#0f172a;color:white;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;">
        <div style="text-align:center;"><h1>Smart Search</h1><p>Enter a query to begin researching.</p></div>
        </body></html>
        """
    
    try:
        results = DDGS().text(q, max_results=10)
        
        results_html = ""
        for r in results:
            results_html += f'''
            <div style="background:#1e293b; padding:20px; border-radius:12px; margin-bottom:16px; border:1px solid rgba(255,255,255,0.05);">
                <a href="{r['href']}" target="_blank" style="color: #60a5fa; text-decoration:none; font-size:18px; font-weight:bold;">{r['title']}</a>
                <div style="color: #94a3b8; font-size:12px; margin: 4px 0;">{r['href']}</div>
                <p style="color: #cbd5e1; font-size:14px; line-height:1.6;">{r['body']}</p>
            </div>
            '''
            
        return f'''
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ background: #0f172a; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; line-height: 1.5; }}
                .search-container {{ max-width: 800px; margin: 0 auto; }}
                .header {{ margin-bottom: 40px; border-bottom: 1px solid #1e293b; padding-bottom: 20px; }}
                .result-card {{ transition: transform 0.2s; }}
                .result-card:hover {{ transform: translateX(5px); }}
                .badge {{ background: #10b981; color: white; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; margin-bottom: 8px; display: inline-block; }}
            </style>
        </head>
        <body>
            <div class="search-container">
                <div class="header">
                    <div class="badge">VIRTUAL RESEARCHER LIVE</div>
                    <h2 style="margin:5px 0;">Search Results for: {q}</h2>
                    <p style="color:#64748b; font-size:12px;">Provided by AI Engine Integrated Search</p>
                </div>
                {results_html if results else '<p>No results found. Try a different query.</p>'}
            </div>
        </body>
        </html>
        '''
    except Exception as e:
        return f"<html><body>Error performing search: {str(e)}</body></html>"

from fastapi.responses import HTMLResponse, Response
# ... existing imports ...

@app.get("/browser/proxy")
async def browser_proxy(url: str = Query(...)):
    try:
        # 1. Standardize URL
        if not url.startswith('http'):
            url = 'https://' + url
            
        # Google specific bypass
        if 'google.com' in url and 'igu=1' not in url:
            url += ('&' if '?' in url else '?') + 'igu=1'

        print(f"Proxying: {url}")

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
        }
        
        async with httpx.AsyncClient(follow_redirects=True, verify=False, timeout=12.0) as client:
            response = await client.get(url, headers=headers)
            content = response.content.decode('utf-8', errors='ignore')
            
            # Final URL after redirects
            final_url = str(response.url)
            base_url = f"{response.url.scheme}://{response.url.host}"
            proxy_endpoint = "http://127.0.0.1:8000/browser/proxy?url="
            
            import re
            
            # 2. Server-Side Link Rewriting (More stable than just JS)
            # This rewrites actual links in the HTML before sending to client
            def link_replacer(match):
                attr = match.group(1)
                orig_url = match.group(2)
                if not orig_url or orig_url.startswith(('#', 'javascript:', 'data:', 'mailto:')):
                    return match.group(0)
                try:
                    full_url = str(httpx.URL(orig_url, base_url=final_url))
                    if '127.0.0.1:8000' in full_url: return match.group(0)
                    return f'{attr}="{proxy_endpoint}{full_url}"'
                except:
                    return match.group(0)

            # Rewrite hrefs and actions
            content = re.sub(r'(href|action)=["\']([^"\']+)["\']', link_replacer, content, flags=re.I)
            
            # 3. Strip Security Headers from HTML Content
            content = re.sub(r'<meta[^>]*http-equiv=["\']?(Content-Security-Policy|X-Frame-Options|frame-ancestors)["\']?[^>]*>', '', content, flags=re.I)
            content = content.replace('X-Frame-Options', 'X-Frame-Disabled')
            content = content.replace('Content-Security-Policy', 'Disabled-CSP')
            
            # 4. Global Interceptor Script (Client Side)
            interceptor_script = f"""
            <script>
                (function() {{
                    window.top = window.self;
                    window.parent = window.self;
                    const proxyBase = "{proxy_endpoint}";

                    function wrap(u) {{
                        if (!u || u.startsWith('javascript:') || u.startsWith('data:') || u.includes('127.0.0.1:8000')) return u;
                        try {{ return proxyBase + encodeURIComponent(new URL(u, window.location.href).href); }} catch(e) {{ return u; }}
                    }}

                    // Intercept clicks on links that might have escaped the server-side rewrite
                    document.addEventListener('click', e => {{
                        const a = e.target.closest('a');
                        if (a && a.href) {{
                            e.preventDefault(); e.stopPropagation();
                            window.location.href = wrap(a.href);
                        }}
                    }}, true);

                    // Intercept form submissions
                    document.addEventListener('submit', e => {{
                        const form = e.target;
                        e.preventDefault(); e.stopPropagation();
                        const action = form.action || window.location.href;
                        const data = new URLSearchParams(new FormData(form)).toString();
                        let targetUrl = action + (action.includes('?') ? '&' : '?') + data;
                        window.location.href = wrap(targetUrl);
                    }}, true);

                    // Force target self on all links (prevents opening new tabs/windows)
                    const fixAll = () => {{
                        document.querySelectorAll('a').forEach(a => {{
                            if (a.target && a.target !== '_self') a.target = '_self';
                        }});
                    }};
                    fixAll();
                    setInterval(fixAll, 1000);

                    // Mock window.open
                    window.open = function(u) {{ window.location.href = wrap(u); return window; }};
                }})();
            </script>
            """
            
            # Inject at start of head
            if '<head>' in content:
                content = content.replace('<head>', f'<head><base href="{final_url}">{interceptor_script}')
            else:
                content = f'<html><head><base href="{final_url}">{interceptor_script}</head><body>{content}</body></html>'
                
            return Response(
                content=content,
                media_type="text/html",
                headers={
                    "X-Frame-Options": "ALLOWALL",
                    "Content-Security-Policy": "frame-ancestors *; default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;",
                    "Access-Control-Allow-Origin": "*",
                    "Cache-Control": "no-cache"
                }
            )
            
    except Exception as e:
        print(f"Proxy Critical Logic Error: {e}")
        return HTMLResponse(content=f'''
            <div style="background:#0f172a; color:white; height:100vh; display:flex; align-items:center; justify-content:center; text-align:center; font-family:sans-serif; padding:20px;">
                <div style="background:#1e293b; padding:40px; border-radius:16px; border:1px solid #334155; max-width:500px;">
                    <h2 style="color:#ef4444;">Shield Engaged</h2>
                    <p style="color:#94a3b8;">{{url}} is heavily protected. Opening in a secure mirror instead.</p>
                    <a href="{{url}}" target="_blank" style="display:inline-block; background:#3b82f6; color:white; padding:12px 24px; border-radius:8px; text-decoration:none; margin-top:20px; font-weight:bold;">Open External Tab</a>
                </div>
            </div>
        ''')

@app.post("/analyze")
async def analyze_resume(file: UploadFile = File(...)):
    try:
        print(f"Analyzing file: {file.filename}")
        if not os.path.exists("temp_uploads"): os.makedirs("temp_uploads")
        file_path = os.path.join("temp_uploads", file.filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        print(f"File saved to: {file_path}")
        # 1. Extreme Parsing (NLP + PhraseMatcher)
        resume_data = parse_resume(file_path)
        print(f"Parsing complete. Found {len(resume_data['skills'])} skills.")
        
        # 2. Extreme Matching (Industrial PRS)
        market_benchmark = {
            "text": "Full Stack Engineer needed for 2026 deployment. Must have proven experience in Cloud Architectures (AWS/Azure), Frontend Excellence (React/Next.js), and AI Integration (OpenAI/LLMs). We value strong Agile/Scrum backgrounds and architectural problem solving.",
            "required_skills": ["Python", "React", "Next.JS", "AWS", "Docker", "Node.JS", "FastAPI", "OpenAI", "Git", "Agile"]
        }
        
        result = calculate_match(resume_data, market_benchmark)
        print(f"Matching complete. Score: {result['prs']}")
        
        # 3. XAI Generation (Explainable AI)
        explanation = generate_explanation(result)
        print("Explanation generated.")
        
        os.remove(file_path)
        
        return {
            "filename": file.filename,
            "skills": resume_data['skills'],
            "categorized_skills": resume_data.get('categorized_skills', {}),
            "prs": result['prs'],
            "breakdown": result['breakdown'],
            "experience_years": resume_data.get('experience_years', 0),
            "explanation": explanation,
            "gaps": result['gaps'],
            "market_standard_used": "Industry 2026 Benchmark"
        }
    except Exception as e:
        print(f"Analysis Error: {e}")
        return {"error": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
