const db = require('../config/db');

// Helper to detect sector of a job based on title, skills, and description
function detectJobSector(title, skills, description) {
  const content = `${title} ${skills} ${description}`.toLowerCase();
  
  const sectors = {
    "Software Engineering & IT": ['react', 'node', 'express', 'postgresql', 'sqlite', 'sql', 'javascript', 'typescript', 'docker', 'kubernetes', 'aws', 'cloud', 'git', 'ci/cd', 'system design', 'software development', 'frontend', 'backend', 'full stack', 'database', 'developer', 'engineer', 'protocol'],
    "AI, Machine Learning & Data Science": ['python', 'pytorch', 'tensorflow', 'machine learning', 'nlp', 'deep learning', 'statistics', 'pandas', 'numpy', 'scikit-learn', 'data science', 'ai', 'artificial intelligence', 'analyst'],
    "UI/UX & Product Design": ['figma', 'ui', 'ux', 'product design', 'wireframes', 'prototyping', 'user research', 'design systems', 'adobe', 'interaction design', 'visual design', 'designer'],
    "Education, Teaching & Training": ['teaching', 'curriculum', 'lesson planning', 'pedagogy', 'classroom', 'student', 'academic', 'education', 'training', 'teacher', 'instructor', 'lecturer'],
    "Business, Management & Administration": ['project management', 'operations', 'finance', 'budgeting', 'strategy', 'marketing', 'sales', 'leadership', 'stakeholder', 'business', 'administration', 'consulting', 'manager', 'controller'],
    "Healthcare & Clinical Medicine": ['patient care', 'nursing', 'medical', 'clinical', 'healthcare', 'treatment', 'doctor', 'nurse', 'hospital'],
    "Government, Public Policy & Law": ['policy', 'compliance', 'regulation', 'public administration', 'legal', 'advocacy', 'governance', 'government', 'law', 'lawyer']
  };

  let selectedSector = "General Professional";
  let maxMatches = 0;

  Object.entries(sectors).forEach(([sectorName, keywords]) => {
    let matches = 0;
    keywords.forEach(kw => {
      if (content.includes(kw)) {
        matches++;
      }
    });
    if (matches > maxMatches) {
      maxMatches = matches;
      selectedSector = sectorName;
    }
  });

  return selectedSector;
}

// Helper to calculate match percentage between a resume and a job
function calculateJobCompatibility(resumeText, resumeParsedData, jobTitle, jobSkills, jobDescription) {
  if (!resumeText || resumeText.trim().length === 0) return 0; // no resume uploaded = 0% match

  let resumeAtsScore = 50;
  if (resumeParsedData) {
    try {
      const parsed = typeof resumeParsedData === 'string' ? JSON.parse(resumeParsedData) : resumeParsedData;
      resumeAtsScore = parsed.overall_score || parsed.ats_score || 50;
    } catch (e) {
      console.error("Error parsing resume parsed_data:", e);
    }
  }

  const resumeLower = resumeText.toLowerCase();
  
  // 1. Direct Skill Match (50% weight)
  const skillsToMatch = (jobSkills || '').toLowerCase().split(/,\s*/).filter(Boolean);
  let skillsMatched = 0;
  if (skillsToMatch.length > 0) {
    skillsToMatch.forEach(skill => {
      if (resumeLower.includes(skill.trim())) {
        skillsMatched++;
      }
    });
  }
  const skillMatchPercent = skillsToMatch.length > 0 ? (skillsMatched / skillsToMatch.length) * 100 : 50;

  // 2. Keyword/Word Overlap Match (30% weight)
  const cleanContent = `${jobTitle} ${jobSkills} ${jobDescription}`.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const jobWords = cleanContent.split(/\s+/).filter(w => w.length >= 4);
  
  // Exclude extremely common stop words to keep match relevant
  const stopWords = new Set([
    'with', 'from', 'this', 'that', 'have', 'your', 'will', 'team', 'work', 'role',
    'their', 'about', 'join', 'more', 'must', 'should', 'would', 'could',
    'other', 'some', 'than', 'then', 'into', 'over', 'also', 'only', 'such', 'very',
    'under', 'been', 'were', 'have', 'has', 'had', 'does', 'doing', 'done',
    'about', 'above', 'after', 'again', 'against', 'all', 'any', 'are', 'because',
    'before', 'being', 'below', 'between', 'both', 'but', 'during', 'each',
    'few', 'for', 'further', 'here', 'how', 'its', 'just', 'more', 'most',
    'once', 'other', 'our', 'out', 'own', 'same', 'she', 'should', 'so',
    'than', 'too', 'very', 'what', 'when', 'where', 'which', 'while', 'who', 'whom',
    'why', 'yourself', 'yourselves', 'themselves'
  ]);
  
  const uniqueJobWords = [...new Set(jobWords)].filter(w => !stopWords.has(w));
  
  let matchedWords = 0;
  uniqueJobWords.forEach(word => {
    if (resumeLower.includes(word)) {
      matchedWords++;
    }
  });
  
  const wordOverlapPercent = uniqueJobWords.length > 0 ? (matchedWords / uniqueJobWords.length) * 100 : 50;

  // 3. Blend them together
  const rawScore = (skillMatchPercent * 0.5) + (wordOverlapPercent * 0.3) + (resumeAtsScore * 0.2);
  
  // Apply a dynamic small jitter/random factor based on the character length of description
  // to ensure scores aren't identical across similar jobs (purely deterministic based on content)
  const descriptionFactor = (jobDescription.length % 21) - 10; // -10 to +10 variance
  
  // Also add a pseudo-random multiplier based on char code of title
  const titleHash = jobTitle ? jobTitle.charCodeAt(0) * jobTitle.length : 1;
  const hashVariance = (titleHash % 19) - 9; // -9 to +9 variance
  
  const finalScore = Math.round(rawScore + descriptionFactor + hashVariance);

  // Return a clean percentage clamped between 1% and 100%
  return Math.min(100, Math.max(1, finalScore));
}

// 1. Get job deck for swiping (exclude jobs already swiped)
exports.getJobsForSwipe = async (req, res) => {
  const userId = req.user.id;

  try {
    // Get user's resume and parsed data to calculate match percentages
    const resumeRes = await db.query('SELECT raw_text, parsed_data FROM resumes WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', [userId]);
    const resumeText = resumeRes.rows.length > 0 ? resumeRes.rows[0].raw_text : null;
    const resumeParsedData = resumeRes.rows.length > 0 ? resumeRes.rows[0].parsed_data : null;

    // Get all jobs that the user hasn't swiped on yet
    const queryStr = `
      SELECT j.*, u.role as recruiter_role
      FROM jobs j
      LEFT JOIN users u ON j.recruiter_id = u.id
      WHERE j.id NOT IN (
        SELECT job_id FROM swipes WHERE user_id = $1
      )
      ORDER BY j.id DESC
    `;
    const jobsRes = await db.query(queryStr, [userId]);

    // Map jobs to calculate matching percentages
    const jobsWithScores = jobsRes.rows.map(job => {
      const matchScore = calculateJobCompatibility(
        resumeText, 
        resumeParsedData, 
        job.title, 
        job.skills, 
        job.description + " " + (job.requirements || "")
      );
      return {
        ...job,
        match_percentage: matchScore
      };
    });

    // Sort jobs: Recruiter-posted jobs get priority, then by compatibility percentage
    jobsWithScores.sort((a, b) => {
      const aIsRecruiter = a.recruiter_role === 'recruiter' ? 1 : 0;
      const bIsRecruiter = b.recruiter_role === 'recruiter' ? 1 : 0;
      if (aIsRecruiter !== bIsRecruiter) {
        return bIsRecruiter - aIsRecruiter;
      }
      return b.match_percentage - a.match_percentage;
    });

    res.json(jobsWithScores);
  } catch (err) {
    console.error("Failed to retrieve jobs for swiping:", err);
    res.status(500).json({ message: "Internal server error retrieving job feed." });
  }
};

// 2. Swipe job (left or right)
exports.swipeJob = async (req, res) => {
  const userId = req.user.id;
  const { job_id, direction } = req.body; // 'left' or 'right'

  if (!job_id || !direction) {
    return res.status(400).json({ message: "job_id and direction ('left' or 'right') are required." });
  }

  try {
    // Insert into swipes
    await db.query(
      'INSERT INTO swipes (user_id, job_id, direction) VALUES ($1, $2, $3)',
      [userId, job_id, direction]
    );

    // If swiped right, automatically create an active job application
    if (direction === 'right') {
      // Get the resume ID
      const resumeRes = await db.query('SELECT id FROM resumes WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', [userId]);
      const resumeId = resumeRes.rows.length > 0 ? resumeRes.rows[0].id : null;

      // Even if they have no resume, we'll allow right swiping and mark a null resume id (they can upload it later)
      await db.query(
        'INSERT INTO applications (user_id, job_id, resume_id, status) VALUES ($1, $2, $3, $4)',
        [userId, job_id, resumeId, 'applied']
      );
    }

    res.json({ message: `Successfully swiped ${direction} on job ${job_id}` });
  } catch (err) {
    console.error("Swipe operation failed:", err);
    res.status(500).json({ message: "Failed to register swiping action." });
  }
};

// 3. Get all applications (swiped right jobs)
exports.getSwipedRightJobs = async (req, res) => {
  const userId = req.user.id;

  try {
    // Retrieve jobs details + application status + latest resume
    const queryStr = `
      SELECT j.*, a.id as application_id, a.status as application_status, a.applied_at, r.parsed_data, r.raw_text
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      LEFT JOIN resumes r ON r.id = (
        SELECT id FROM resumes WHERE user_id = a.user_id ORDER BY created_at DESC LIMIT 1
      )
      WHERE a.user_id = $1
      ORDER BY a.applied_at DESC
    `;
    const appRes = await db.query(queryStr, [userId]);

    // Format output
    const applications = appRes.rows.map(app => {
      const matchScore = calculateJobCompatibility(
        app.raw_text, 
        app.parsed_data, 
        app.title, 
        app.skills, 
        app.description + ' ' + (app.requirements || '')
      );
      return {
        id: app.application_id,
        job_id: app.id,
        title: app.title,
        company: app.company,
        location: app.location,
        salary: app.salary,
        description: app.description,
        skills: app.skills,
        status: app.application_status,
        applied_at: app.applied_at,
        match_percentage: matchScore,
        apply_url: app.apply_url
      };
    });

    res.json(applications);
  } catch (err) {
    console.error("Failed to retrieve swiped right jobs:", err);
    res.status(500).json({ message: "Internal server error retrieving applications list." });
  }
};

// 4. Recruiter: Post a new job vacancy
exports.postJob = async (req, res) => {
  const recruiterId = req.user.id;
  const { title, company, description, requirements, skills, salary, location, experience_level, apply_url } = req.body;

  if (req.user.role !== 'recruiter') {
    return res.status(403).json({ message: "Unauthorized. Only recruiters can post jobs." });
  }

  if (!title || !company || !description) {
    return res.status(400).json({ message: "Title, company, and description are required." });
  }

  try {
    const insertRes = await db.query(
      `INSERT INTO jobs (title, company, description, requirements, skills, salary, location, experience_level, apply_url, recruiter_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
      [title, company, description, requirements || '', skills || '', salary || '', location || '', experience_level || '', apply_url || null, recruiterId]
    );

    const jobId = db.getDbType() === 'sqlite' ? insertRes.lastID : insertRes.rows[0].id;

    res.status(201).json({
      message: "Job posted successfully",
      job: {
        id: jobId,
        title,
        company,
        description,
        requirements,
        skills,
        salary,
        location,
        experience_level,
        apply_url
      }
    });
  } catch (err) {
    console.error("Failed to create job posting:", err);
    res.status(500).json({ message: "Internal server error posting job." });
  }
};

// 5. Recruiter: Get all posted jobs
exports.getRecruiterJobs = async (req, res) => {
  const recruiterId = req.user.id;

  if (req.user.role !== 'recruiter') {
    return res.status(403).json({ message: "Unauthorized. Only recruiters can retrieve company postings." });
  }

  try {
    const jobsRes = await db.query('SELECT * FROM jobs WHERE recruiter_id = $1 ORDER BY created_at DESC', [recruiterId]);
    res.json(jobsRes.rows);
  } catch (err) {
    console.error("Failed to fetch recruiter jobs:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

// 6. Recruiter: View applicants for their posted jobs
exports.getJobApplicants = async (req, res) => {
  const recruiterId = req.user.id;

  if (req.user.role !== 'recruiter') {
    return res.status(403).json({ message: "Unauthorized." });
  }

  try {
    const queryStr = `
      SELECT 
        a.id as application_id, 
        a.status as application_status, 
        a.applied_at,
        u.id as user_id, 
        u.full_name, 
        u.email,
        r.raw_text as resume_text,
        r.parsed_data,
        j.id as job_id, 
        j.title as job_title,
        j.skills as job_skills,
        j.description as job_description
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN users u ON a.user_id = u.id
      LEFT JOIN resumes r ON r.id = (
        SELECT id FROM resumes WHERE user_id = a.user_id ORDER BY created_at DESC LIMIT 1
      )
      WHERE j.recruiter_id = $1
      ORDER BY a.applied_at DESC
    `;
    const applicantsRes = await db.query(queryStr, [recruiterId]);

    const formattedApplicants = applicantsRes.rows.map(applicant => {
      let atsScore = 0;
      let resumeAnalysis = null;
      let compatibilityScore = 0;

      if (applicant.parsed_data) {
        try {
          resumeAnalysis = typeof applicant.parsed_data === 'string' ? JSON.parse(applicant.parsed_data) : applicant.parsed_data;
          atsScore = resumeAnalysis.ats_score || 0;
        } catch (e) {
          console.error("Failed to parse resume parsed_data:", e);
        }
      }

      if (applicant.resume_text) {
        compatibilityScore = calculateJobCompatibility(
          applicant.resume_text, 
          applicant.parsed_data, 
          applicant.job_title, 
          applicant.job_skills, 
          applicant.job_description || ''
        );
      }

      return {
        application_id: applicant.application_id,
        application_status: applicant.application_status,
        applied_at: applicant.applied_at,
        job: {
          id: applicant.job_id,
          title: applicant.job_title
        },
        applicant: {
          id: applicant.user_id,
          name: applicant.full_name,
          email: applicant.email,
          ats_score: atsScore,
          compatibility: compatibilityScore,
          resume_text: applicant.resume_text,
          analysis: resumeAnalysis
        }
      };
    });

    res.json(formattedApplicants);
  } catch (err) {
    console.error("Failed to retrieve job applicants:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

// 7. Recruiter: Update applicant status
exports.updateApplicationStatus = async (req, res) => {
  const recruiterId = req.user.id;
  const { application_id, status } = req.body; // 'applied', 'interview', 'rejected', 'accepted'

  if (req.user.role !== 'recruiter') {
    return res.status(403).json({ message: "Unauthorized." });
  }

  if (!application_id || !status) {
    return res.status(400).json({ message: "application_id and status are required." });
  }

  try {
    // Verify recruiter owns this job
    const verifyQuery = `
      SELECT a.id FROM applications a
      JOIN jobs j ON a.job_id = j.id
      WHERE a.id = $1 AND j.recruiter_id = $2
    `;
    const verifyRes = await db.query(verifyQuery, [application_id, recruiterId]);
    if (verifyRes.rows.length === 0) {
      return res.status(403).json({ message: "Unauthorized. You cannot modify applications for other companies' jobs." });
    }

    await db.query('UPDATE applications SET status = $1 WHERE id = $2', [status, application_id]);
    res.json({ message: `Successfully updated application status to: ${status}` });
  } catch (err) {
    console.error("Failed to update application status:", err);
    res.status(500).json({ message: "Internal server error updating applicant." });
  }
};

// 8. Seeker/Simulated: Update/Sync application pipeline status
exports.syncApplicationStatus = async (req, res) => {
  const userId = req.user.id;
  const { application_id } = req.body;

  if (!application_id) {
    return res.status(400).json({ message: "application_id is required." });
  }

  try {
    // Verify application belongs to user
    const appRes = await db.query('SELECT status FROM applications WHERE id = $1 AND user_id = $2', [application_id, userId]);
    if (appRes.rows.length === 0) {
      return res.status(404).json({ message: "Application not found." });
    }

    const currentStatus = appRes.rows[0].status;
    let nextStatus = 'applied';
    
    // Progress status sequentially
    if (currentStatus === 'applied') {
      nextStatus = 'interview';
    } else if (currentStatus === 'interview') {
      nextStatus = 'accepted';
    } else if (currentStatus === 'accepted') {
      nextStatus = 'rejected';
    } else {
      nextStatus = 'applied';
    }

    await db.query('UPDATE applications SET status = $1 WHERE id = $2', [nextStatus, application_id]);
    res.json({ message: `Pipeline synced. Status progressed from ${currentStatus} to ${nextStatus}.`, newStatus: nextStatus });
  } catch (err) {
    console.error("Failed to sync application status:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};
