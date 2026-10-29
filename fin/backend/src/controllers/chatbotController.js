const fs = require('fs');
const path = require('path');

// Documentation Chatbot Controller
// This controller handles queries about the project documentation

// Load documentation files
const loadDocumentation = () => {
    const docsPath = path.join(__dirname, '../../../');
    const docs = {
        readme: fs.readFileSync(path.join(docsPath, 'README.md'), 'utf-8'),
        howToRun: fs.readFileSync(path.join(docsPath, 'HOW_TO_RUN.md'), 'utf-8'),
        academic: fs.readFileSync(path.join(docsPath, 'ACADEMIC_RESEARCH_DOCUMENTATION.md'), 'utf-8'),
    };
    return docs;
};

// Simple keyword-based search (can be enhanced with AI/LLM)
const searchDocumentation = (query, docs) => {
    const results = [];
    const queryLower = query.toLowerCase();

    // Search in each document
    Object.entries(docs).forEach(([docName, content]) => {
        const lines = content.split('\n');
        lines.forEach((line, index) => {
            if (line.toLowerCase().includes(queryLower)) {
                results.push({
                    document: docName,
                    lineNumber: index + 1,
                    content: line.trim(),
                    context: lines.slice(Math.max(0, index - 2), Math.min(lines.length, index + 3)).join('\n')
                });
            }
        });
    });

    return results;
};

// Generate response based on query
const generateResponse = (query, searchResults) => {
    if (searchResults.length === 0) {
        return {
            answer: "I couldn't find specific information about that in the documentation. Could you rephrase your question?",
            sources: []
        };
    }

    // Extract relevant information
    const topResults = searchResults.slice(0, 5);
    const sources = topResults.map(r => ({
        document: r.document,
        line: r.lineNumber,
        snippet: r.content
    }));

    // Generate answer based on query type
    let answer = '';
    const queryLower = query.toLowerCase();

    if (queryLower.includes('how to run') || queryLower.includes('start')) {
        answer = `To run the project, follow these steps:

1. **Start AI Engine**: 
   \`\`\`bash
   cd ai_engine
   venv\\Scripts\\activate
   uvicorn main:app --host 127.0.0.1 --port 8000
   \`\`\`

2. **Start Backend**:
   \`\`\`bash
   cd backend
   node src/server.js
   \`\`\`

3. **Start Frontend**:
   \`\`\`bash
   cd frontend
   npm run dev -- --host 127.0.0.1
   \`\`\`

Then open http://127.0.0.1:5173 in your browser.`;
    } else if (queryLower.includes('prs') || queryLower.includes('ranking')) {
        answer = `The Professional Ranking System (PRS) is a multi-factor algorithm that scores candidates from 0-100%:

**Components**:
- Core Technical Skills (35%)
- Secondary Skills (15%)
- Project Relevance (15%)
- Semantic Depth (10%)
- Experience & Seniority (15%)
- Professional Base (10%)

**Tiers**:
- Elite Specialist: 88-100%
- Expert Practitioner: 70-87%
- Professional Candidate: 50-69%
- Developing: 0-49%`;
    } else if (queryLower.includes('algorithm') || queryLower.includes('how it works')) {
        answer = `The system uses several algorithms:

1. **Resume Parsing**: spaCy NLP for skill extraction
2. **PRS Calculation**: TF-IDF + Cosine Similarity for semantic matching
3. **XAI**: Rule-based Natural Language Generation for explanations
4. **Cognitive Assessment**: Adaptive difficulty scoring

See ACADEMIC_RESEARCH_DOCUMENTATION.md for detailed pseudocode.`;
    } else if (queryLower.includes('tech stack') || queryLower.includes('technologies')) {
        answer = `**Technology Stack**:

**Frontend**: React 18, Vite, Recharts, Framer Motion
**Backend**: Node.js, Express, MongoDB, Socket.io
**AI Engine**: Python, FastAPI, spaCy, scikit-learn
**Database**: MongoDB Atlas`;
    } else {
        // Generic response with context
        answer = `Based on the documentation:\n\n${topResults[0].context}\n\nFor more details, check the ${topResults[0].document} documentation.`;
    }

    return { answer, sources };
};

// @desc    Query documentation chatbot
// @route   POST /api/chatbot/query
// @access  Public
exports.queryDocumentation = async (req, res) => {
    try {
        const { query } = req.body;

        if (!query) {
            return res.status(400).json({ message: 'Query is required' });
        }

        // Load documentation
        const docs = loadDocumentation();

        // Search for relevant information
        const searchResults = searchDocumentation(query, docs);

        // Generate response
        const response = generateResponse(query, searchResults);

        res.json({
            query,
            answer: response.answer,
            sources: response.sources,
            timestamp: new Date()
        });

    } catch (error) {
        console.error('Chatbot error:', error);
        res.status(500).json({ message: 'Error processing query', error: error.message });
    }
};

// @desc    Get common questions
// @route   GET /api/chatbot/faq
// @access  Public
exports.getFAQ = async (req, res) => {
    const faq = [
        {
            question: "How do I run the project?",
            category: "Setup"
        },
        {
            question: "What is the Professional Ranking System (PRS)?",
            category: "Features"
        },
        {
            question: "What algorithms does the system use?",
            category: "Technical"
        },
        {
            question: "What technologies are used?",
            category: "Technical"
        },
        {
            question: "How does resume analysis work?",
            category: "Features"
        },
        {
            question: "What are the system requirements?",
            category: "Setup"
        },
        {
            question: "How do I deploy to production?",
            category: "Deployment"
        },
        {
            question: "What is the Cognitive Assessment Hub?",
            category: "Features"
        }
    ];

    res.json(faq);
};
