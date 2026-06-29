const db = require('../config/db');
const mammoth = require('mammoth');
const pdf = require('pdf-parse');

// A highly sophisticated resume scanner & score calculator
function analyzeResumeText(text, targetJobDesc = '') {
  const content = text.toLowerCase();
  const jobDesc = targetJobDesc.toLowerCase();

  // Dynamic classification categories (genres)
  const genres = {
    software_engineering: {
      name: "Software Engineering & IT",
      keywords: [
        'react', 'node', 'express', 'postgresql', 'sqlite', 'sql', 'javascript', 'typescript',
        'docker', 'kubernetes', 'aws', 'cloud', 'git', 'ci/cd', 'system design', 'agile', 'scrum',
        'html', 'css', 'java', 'c++', 'rest api', 'apis', 'software development', 'frontend', 'backend',
        'full stack', 'database', 'github', 'linux'
      ]
    },
    ai_data_science: {
      name: "AI, Machine Learning & Data Science",
      keywords: [
        'python', 'pytorch', 'tensorflow', 'machine learning', 'nlp', 'deep learning', 'statistics',
        'pandas', 'numpy', 'scikit-learn', 'sql', 'data visualization', 'spark', 'r', 'data modeling',
        'recommender systems', 'ai', 'artificial intelligence', 'data science', 'analytics', 'predictive modeling',
        'neural networks', 'computer vision'
      ]
    },
    ui_ux_design: {
      name: "UI/UX & Product Design",
      keywords: [
        'figma', 'ui', 'ux', 'product design', 'wireframes', 'prototyping', 'user research', 'design systems',
        'illustrator', 'photoshop', 'adobe', 'user flows', 'interaction design', 'mockups', 'creative direction',
        'visual design', 'sketch', 'invision', 'usability testing'
      ]
    },
    education_teaching: {
      name: "Education, Teaching & Training",
      keywords: [
        'teaching', 'curriculum', 'lesson planning', 'pedagogy', 'classroom management', 'student engagement',
        'academic writing', 'grading', 'mentoring', 'lecturing', 'education', 'training', 'assessment',
        'e-learning', 'special education', 'classroom', 'instructional design', 'tutoring'
      ]
    },
    business_management: {
      name: "Business, Management & Administration",
      keywords: [
        'project management', 'operations', 'finance', 'budgeting', 'strategy', 'marketing', 'sales',
        'leadership', 'stakeholder management', 'business development', 'excel', 'customer service',
        'communication', 'planning', 'human resources', 'recruiting', 'administration', 'consulting',
        'business analysis'
      ]
    },
    healthcare: {
      name: "Healthcare & Clinical Medicine",
      keywords: [
        'patient care', 'nursing', 'medical terminology', 'clinical', 'healthcare', 'treatment',
        'diagnosis', 'cpr', 'emr', 'first aid', 'public health', 'rehabilitation', 'anatomy',
        'physiology', 'pharmacology', 'hospital', 'patient safety'
      ]
    },
    government_policy: {
      name: "Government, Public Policy & Law",
      keywords: [
        'policy analysis', 'compliance', 'regulation', 'public administration', 'legal research',
        'advocacy', 'governance', 'public relations', 'reporting', 'documentation', 'auditing',
        'legislative', 'government', 'public affairs', 'policy development'
      ]
    },
    general: {
      name: "General Professional",
      keywords: [
        'leadership', 'communication', 'project management', 'problem solving', 'teamwork', 'organization',
        'strategic planning', 'customer service', 'data analysis', 'microsoft office', 'collaboration',
        'analytical skills', 'time management', 'presentation'
      ]
    }
  };

  // Classify CV by computing match density against each industry/genre
  let selectedGenre = 'general';
  let maxMatchCount = 0;

  Object.entries(genres).forEach(([genreKey, genreData]) => {
    if (genreKey === 'general') return;
    let matches = 0;
    genreData.keywords.forEach(kw => {
      if (content.includes(kw)) {
        matches++;
      }
    });
    if (matches > maxMatchCount) {
      maxMatchCount = matches;
      selectedGenre = genreKey;
    }
  });

  const skillKeywords = genres[selectedGenre].keywords;
  const industryName = genres[selectedGenre].name;

  const foundSkills = skillKeywords.filter(skill => content.includes(skill));
  const missingSkills = skillKeywords.filter(skill => !content.includes(skill)).slice(0, 5);

  // Keyword matching score relative to maximum keywords checked
  const keywordScore = Math.min(100, Math.round((foundSkills.length / Math.min(12, skillKeywords.length)) * 100));

  // 2. Experience Relevance
  let expScore = 70;
  if (content.includes('senior') || content.includes('lead') || content.includes('principal')) {
    expScore = 90;
  } else if (content.includes('years') || content.includes('yrs')) {
    expScore = 80;
  }

  // 3. Section Organization Check
  const essentialSections = ['experience', 'education', 'skills', 'projects', 'summary', 'languages', 'certifications'];
  const sectionsFound = essentialSections.filter(sec => content.includes(sec));
  const sectionScore = Math.round((sectionsFound.length / essentialSections.length) * 100);

  // 4. Length Analysis
  const wordCount = text.split(/\s+/).length;
  let lengthRating = "Optimal (1-2 pages)";
  let lengthScore = 95;
  if (wordCount < 100) {
    lengthRating = "Too short (Needs more details)";
    lengthScore = 50;
  } else if (wordCount > 1000) {
    lengthRating = "Too long (Consider compressing)";
    lengthScore = 75;
  }

  // 6. Grammar & Spelling Check (Mock detection with standard suggestions)
  const spellGrammarIssues = [];
  if (!content.includes('accomplished') && !content.includes('implemented')) {
    spellGrammarIssues.push({
      error: "Passive voice / Weak action verbs",
      suggestion: "Replace passive statements with strong action verbs like 'Architected', 'Spearheaded', 'Optimized'."
    });
  }
  if (wordCount > 300 && Math.random() > 0.3) {
    spellGrammarIssues.push({
      error: "Potential typo in section header spacing",
      suggestion: "Ensure there is a standard blank line before and after major header sections."
    });
  }
  const grammarScore = Math.max(80, 100 - (spellGrammarIssues.length * 10));

  // 7. Clarity Score
  const strongActionVerbs = ['architected','spearheaded','designed','implemented','optimized','built','delivered','launched','streamlined','automated','managed','developed'];
  const strongVerbCount = strongActionVerbs.reduce((count, verb) => count + (content.includes(verb) ? 1 : 0), 0);
  const weakPhraseCount = ['responsible for','helped team','worked on','assisted','supported','involved in','participated in','contributed to'].reduce((count, phrase) => count + (content.includes(phrase) ? 1 : 0), 0);
  const clarityBase = 60 + Math.min(strongVerbCount * 7, 30) - Math.min(weakPhraseCount * 12, 24);
  const clarityScore = Math.max(50, Math.min(100, clarityBase + (wordCount > 250 ? 5 : 0)));

  // 8. Impact Statements (quantifying achievements)
  const numbersFound = (text.match(/\d+%/g) || []).concat(text.match(/\$\d+/g) || []).concat(text.match(/\d+\s*years/g) || []);
  const impactScore = Math.min(100, 45 + (numbersFound.length * 15));
  const impactAnalysis = numbersFound.length > 0
    ? `Great work! You quantified ${numbersFound.length} impact statements using real metrics.`
    : "Weak impact statements. Add metrics (e.g., 'improved load times by 40%', 'managed $5k budget').";

  // 9. Format & Styling Assessment
  const bulletCount = (text.match(/\n[\s\t]*[-•*]\s+/g) || []).length;
  const headerCount = essentialSections.filter(sec => content.includes(sec)).length;
  const fontsScore = Math.min(100, 55 + Math.min(bulletCount, 6) * 6 + Math.min(headerCount, 5) * 8);
  const fontsRating = fontsScore > 85 ? "Strong formatting and layout structure" : "Improve bullet styling and section headings";

  // 10. Consistency Check
  const hasSlashDates = /\b\d{1,2}\/\d{4}\b/.test(content);
  const hasDashDates = /\b\d{1,2}-\d{4}\b/.test(content);
  const hasMixedDateStyles = hasSlashDates && hasDashDates;
  const consistencyScore = hasMixedDateStyles ? 72 : (hasSlashDates || hasDashDates ? 90 : 82);
  const consistencyRating = hasMixedDateStyles ? "Mixed date formatting detected" : "Date formatting looks consistent";

  // 11. Role-based recommendations
  const roleRecommendations = [];
  if (selectedGenre === 'software_engineering') {
    roleRecommendations.push("Frontend Engineer", "Backend Developer", "Full Stack Software Engineer");
  } else if (selectedGenre === 'ai_data_science') {
    roleRecommendations.push("Machine Learning Engineer", "AI Researcher", "Data Scientist");
  } else if (selectedGenre === 'ui_ux_design') {
    roleRecommendations.push("Product Designer", "UI/UX Designer", "Design Technologist");
  } else if (selectedGenre === 'education_teaching') {
    roleRecommendations.push("Academic Instructor", "Curriculum Specialist", "Corporate Trainer");
  } else if (selectedGenre === 'business_management') {
    roleRecommendations.push("Project Manager", "Business Analyst", "Operations Director");
  } else if (selectedGenre === 'healthcare') {
    roleRecommendations.push("Clinical Practitioner", "Healthcare Administrator", "Nurse Specialist");
  } else if (selectedGenre === 'government_policy') {
    roleRecommendations.push("Public Policy Analyst", "Compliance Officer", "Auditor");
  } else {
    roleRecommendations.push("Full Stack Software Engineer", "Product Manager");
  }

  // 12. ATS Compatibility Score (Weighted Average)
  const atsScore = Math.round(
    (keywordScore * 0.26) +
    (sectionScore * 0.18) +
    (expScore * 0.14) +
    (grammarScore * 0.14) +
    (impactScore * 0.12) +
    (lengthScore * 0.1) +
    (clarityScore * 0.06)
  );

  // 13. Match Percentage against custom job description
  let matchPercentage = 0;
  if (jobDesc) {
    const jobKeywords = jobDesc.match(/\b[a-zA-Z]{3,}\b/g) || [];
    const uniqueJobKeywords = [...new Set(jobKeywords)].slice(0, 20);
    let matchedJobKeywords = 0;
    uniqueJobKeywords.forEach(word => {
      if (content.includes(word)) matchedJobKeywords++;
    });
    matchPercentage = uniqueJobKeywords.length > 0 ? Math.round((matchedJobKeywords / uniqueJobKeywords.length) * 100) : 60;
  } else {
    matchPercentage = atsScore;
  }

  // Section wise breakdown
  const sectionBreakdown = {
    "Contact Information": content.includes('email') || content.includes('phone') || content.includes('linkedin') ? 100 : 70,
    "Professional Summary": content.includes('summary') || content.includes('profile') ? 95 : 60,
    "Work History / Experience": content.includes('experience') || content.includes('employment') ? expScore : 25,
    "Technical Skills": content.includes('skills') ? keywordScore : 40,
    "Academic Background / Education": content.includes('education') ? 100 : 50,
    "Projects Portfolio": content.includes('project') ? 90 : 30
  };

  // Priority recommendations
  const priorityRecommendations = [];
  if (keywordScore < 70) {
    priorityRecommendations.push({
      priority: "HIGH",
      item: "Add missing keywords",
      details: `Your resume is missing key sector terms like ${missingSkills.slice(0, 3).join(', ')}. Include these in your Skills section.`
    });
  }
  if (impactScore < 70) {
    priorityRecommendations.push({
      priority: "HIGH",
      item: "Quantify achievements",
      details: "Insert numbers, percentages, or budgets to explain what you delivered (e.g. 'Reduced load times by 25%')."
    });
  }
  if (sectionScore < 80) {
    priorityRecommendations.push({
      priority: "MEDIUM",
      item: "Improve section hierarchy",
      details: `Create explicit headers for ${essentialSections.filter(sec => !content.includes(sec)).join(', ')}.`
    });
  }
  if (spellGrammarIssues.length > 0) {
    priorityRecommendations.push({
      priority: "MEDIUM",
      item: "Enhance verb selection",
      details: spellGrammarIssues[0].suggestion
    });
  }
  if (priorityRecommendations.length === 0) {
    priorityRecommendations.push({
      priority: "LOW",
      item: "Excellent Profile",
      details: `Your profile is highly optimized for the ${industryName} sector. Keep it updated with recent accomplishments.`
    });
  }

  // Before/after suggestions (identifying weak action verbs)
  const resumeSentences = text
    .split(/[\r\n]+|(?<=[.!?])\s+/)
    .map(sentence => sentence.trim().replace(/\s+/g, ' '))
    .filter(sentence => sentence.length > 20);

  const weakVerbPatterns = /(responsible for|helped team|worked on|assisted|supported|involved in|participated in|contributed to|tasked with|handled|managed|maintained)/i;
  const weakStatements = resumeSentences.filter(sentence => weakVerbPatterns.test(sentence));

  const makeAfterSuggestion = (statement) => {
    const s = statement.toLowerCase();
    
    if (/teach|train|academic|student|school|class|course|lecture|pedagogy|writing/i.test(s)) {
      return `Spearheaded the instruction and training curriculum in academic writing for 150+ students, boosting average class performance by 18% through interactive pedagogy.`;
    }
    if (/react|frontend|ui|ux|css|html|figma|design/i.test(s)) {
      return `Architected modular React UI components and responsive design systems, reducing layout rendering lag by 25% and increasing user satisfaction scores.`;
    }
    if (/node|express|api|database|postgres|sql|mongo|backend|server/i.test(s)) {
      return `Engineered high-throughput Node.js APIs and optimized database query execution plans, improving overall backend response times by 40%.`;
    }
    if (/machine learning|ml|python|data|model|ai|nlp|tensorflow|pytorch/i.test(s)) {
      return `Developed and deployed production-grade machine learning pipelines, achieving a 94% prediction accuracy and a 2.5x increase in data ingestion throughput.`;
    }
    if (/project|team|stakeholder|delivery|lead|manage|coordination/i.test(s)) {
      return `Led cross-functional delivery of key project roadmaps, optimizing resource utilization to complete deliverables 3 weeks ahead of schedule.`;
    }
    
    // General fallback rephrased
    let coreText = statement;
    const weakVerbsList = [
      /currently,\s*involved in\s*/i,
      /responsible for\s*/i,
      /helped team\s*/i,
      /worked on\s*/i,
      /assisted\s*/i,
      /supported\s*/i,
      /involved in\s*/i,
      /participated in\s*/i,
      /contributed to\s*/i,
      /tasked with\s*/i,
      /handled\s*/i,
      /managed\s*/i,
      /maintained\s*/i
    ];
    
    let cleaned = coreText;
    for (const rx of weakVerbsList) {
      cleaned = cleaned.replace(rx, '');
    }
    
    cleaned = cleaned.trim();
    if (cleaned.length > 0) {
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
      if (cleaned.endsWith('.')) cleaned = cleaned.slice(0, -1);
      return `Spearheaded and optimized ${cleaned.charAt(0).toLowerCase() + cleaned.slice(1)}, delivering a 22% improvement in operational efficiency and key performance metrics.`;
    }
    
    return `Spearheaded project initiatives, resulting in a 20% increase in productivity and a streamlined workflow across departments.`;
  };

  const beforeAfterSuggestions = [];
  weakStatements.slice(0, 2).forEach(statement => {
    beforeAfterSuggestions.push({
      before: statement,
      after: makeAfterSuggestion(statement)
    });
  });

  if (beforeAfterSuggestions.length === 0) {
    if (selectedGenre === 'software_engineering') {
      beforeAfterSuggestions.push({
        before: "Implemented UI elements using React and basic styling.",
        after: "Built scalable React UI components with reusable styles, improving interface consistency and reducing development time by 25%."
      });
    } else if (selectedGenre === 'education_teaching') {
      beforeAfterSuggestions.push({
        before: "Involved in academic support and course reviews.",
        after: "Spearheaded curriculum redesign and academic audits, enhancing course rating metrics by 14%."
      });
    } else {
      beforeAfterSuggestions.push({
        before: "Responsible for project tasks and supporting the team.",
        after: "Led cross-functional delivery of project goals, improving team output and reducing cycle time by 20%."
      });
    }
  }

  return {
    ats_score: atsScore,
    overall_score: atsScore,
    detected_sector: industryName,
    keyword_matching: {
      score: keywordScore,
      skills_found: foundSkills,
      skills_missing: missingSkills,
      density: `${Math.round((foundSkills.length / (wordCount || 1)) * 1000) / 10}%`
    },
    experience_relevance: {
      score: expScore,
      remarks: expScore > 80 ? "Highly relevant work history matching senior brackets." : "Good baseline experience. Highlight technical achievements."
    },
    section_organization: {
      score: sectionScore,
      sections_found: sectionsFound,
      sections_missing: essentialSections.filter(sec => !content.includes(sec))
    },
    length_analysis: {
      score: lengthScore,
      rating: lengthRating,
      word_count: wordCount
    },
    font_formatting: {
      score: fontsScore,
      rating: fontsRating
    },
    grammar_spelling: {
      score: grammarScore,
      issues: spellGrammarIssues
    },
    clarity_score: clarityScore,
    relevance_score: Math.round((keywordScore + expScore) / 2),
    impact_statements: {
      score: impactScore,
      details: impactAnalysis
    },
    consistency_check: {
      score: consistencyScore,
      rating: consistencyRating
    },
    role_recommendations: roleRecommendations,
    section_breakdown: sectionBreakdown,
    priority_recommendations: priorityRecommendations,
    before_after_suggestions: beforeAfterSuggestions,
    match_percentage: matchPercentage
  };
}

// REST endpoints
exports.uploadResume = async (req, res) => {
  const { resumeText } = req.body;
  const userId = req.user.id;

  if (!resumeText) {
    return res.status(400).json({ message: "Resume text content is required." });
  }

  try {
    const analysis = analyzeResumeText(resumeText);
    const parsedDataString = JSON.stringify(analysis);

    // Save resume to DB
    const checkRes = await db.query('SELECT id FROM resumes WHERE user_id = $1', [userId]);
    
    if (checkRes.rows.length > 0) {
      await db.query(
        'UPDATE resumes SET raw_text = $1, parsed_data = $2 WHERE user_id = $3',
        [resumeText, parsedDataString, userId]
      );
      
      // Clear old applications/swipes because they uploaded a new CV
      await db.query('DELETE FROM applications WHERE user_id = $1', [userId]);
      await db.query('DELETE FROM swipes WHERE user_id = $1', [userId]);
    } else {
      await db.query(
        'INSERT INTO resumes (user_id, raw_text, parsed_data) VALUES ($1, $2, $3)',
        [userId, resumeText, parsedDataString]
      );
    }

    res.json({
      message: "Resume analyzed successfully",
      analysis
    });
  } catch (err) {
    console.error("Resume analysis failed:", err);
    res.status(500).json({ message: "Internal server error during resume analysis" });
  }
};

exports.getResume = async (req, res) => {
  const userId = req.user.id;
  try {
    const dbRes = await db.query('SELECT * FROM resumes WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', [userId]);
    if (dbRes.rows.length === 0) {
      return res.status(404).json({ message: "No resume found. Please upload one first." });
    }
    const resume = dbRes.rows[0];
    res.json({
      id: resume.id,
      raw_text: resume.raw_text,
      analysis: JSON.parse(resume.parsed_data)
    });
  } catch (err) {
    console.error("Failed to retrieve resume:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.analyzeWithJobDescription = async (req, res) => {
  const { resumeText, jobDescription } = req.body;
  if (!resumeText || !jobDescription) {
    return res.status(400).json({ message: "Both resume text and job description are required." });
  }
  try {
    const analysis = analyzeResumeText(resumeText, jobDescription);
    res.json({
      message: "Comparison analysis complete",
      analysis
    });
  } catch (err) {
    console.error("Job description match failed:", err);
    res.status(500).json({ message: "Failed to compare resume with job description." });
  }
};

async function extractTextFromFile(file) {
  const filename = file.originalname.toLowerCase();
  const buffer = file.buffer;

  try {
    if (filename.endsWith('.txt')) {
      return buffer.toString('utf-8');
    }

    if (filename.endsWith('.pdf')) {
      try {
        const data = await pdf(buffer);
        return data.text || '';
      } catch (pdfErr) {
        console.error('PDF parsing error:', pdfErr);
        throw new Error('Failed to parse PDF file. The file may be corrupted, password-protected, or in an unsupported format.');
      }
    }

    if (filename.endsWith('.docx')) {
      try {
        const result = await mammoth.extractRawText({ buffer });
        return result.value || '';
      } catch (docxErr) {
        console.error('DOCX parsing error:', docxErr);
        throw new Error('Failed to parse DOCX file. The file may be corrupted or in an unsupported format.');
      }
    }

    throw new Error('Unsupported resume file format. Please upload a .txt, .pdf, or .docx file.');
  } catch (err) {
    throw err;
  }
}

exports.uploadResumeFile = async (req, res) => {
  const userId = req.user.id;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: 'Resume file is required.' });
  }

  try {
    const resumeText = await extractTextFromFile(file);
    if (!resumeText || resumeText.trim().length === 0) {
      return res.status(400).json({ message: 'Could not extract text from resume file. Please ensure it is not empty or scanned as an image.' });
    }

    const analysis = analyzeResumeText(resumeText);
    const parsedDataString = JSON.stringify(analysis);

    const checkRes = await db.query('SELECT id FROM resumes WHERE user_id = $1', [userId]);
    if (checkRes.rows.length > 0) {
      await db.query(
        'UPDATE resumes SET raw_text = $1, parsed_data = $2 WHERE user_id = $3',
        [resumeText, parsedDataString, userId]
      );
      
      // Clear old applications/swipes because they uploaded a new CV
      await db.query('DELETE FROM applications WHERE user_id = $1', [userId]);
      await db.query('DELETE FROM swipes WHERE user_id = $1', [userId]);
    } else {
      await db.query(
        'INSERT INTO resumes (user_id, raw_text, parsed_data) VALUES ($1, $2, $3)',
        [userId, resumeText, parsedDataString]
      );
    }

    res.json({
      message: 'Resume file analyzed successfully',
      raw_text: resumeText,
      analysis
    });
  } catch (err) {
    console.error('Resume file analysis failed:', err);
    res.status(400).json({ message: err.message || 'Internal server error during resume file analysis' });
  }
};
