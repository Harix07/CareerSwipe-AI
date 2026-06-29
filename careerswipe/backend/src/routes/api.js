const express = require('express');
const multer = require('multer');
const router = express.Router();
const auth = require('../middleware/auth');

const authController = require('../controllers/authController');
const resumeController = require('../controllers/resumeController');
const jobController = require('../controllers/jobController');

const upload = multer();

// 1. Authentication Routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', auth, authController.getProfile);

// 2. Resume Parsing & ATS Metrics Routes
router.post('/resumes/upload', auth, resumeController.uploadResume);
router.post('/resumes/upload-file', auth, upload.single('resumeFile'), resumeController.uploadResumeFile);
router.get('/resumes/current', auth, resumeController.getResume);
router.post('/resumes/compare', auth, resumeController.analyzeWithJobDescription);

// 3. Seeker Deck & Applications
router.get('/jobs/swipe-feed', auth, jobController.getJobsForSwipe);
router.post('/jobs/swipe', auth, jobController.swipeJob);
router.get('/jobs/applications', auth, jobController.getSwipedRightJobs);
router.post('/jobs/applications/sync', auth, jobController.syncApplicationStatus);

// 4. Recruiter Controls
router.post('/recruiter/jobs', auth, jobController.postJob);
router.get('/recruiter/jobs', auth, jobController.getRecruiterJobs);
router.get('/recruiter/applicants', auth, jobController.getJobApplicants);
router.post('/recruiter/applicants/status', auth, jobController.updateApplicationStatus);

// 5. Feedback / Testimonial Routes (Public)
router.post('/feedback', async (req, res) => {
  try {
    const { author, role, company, quote, avatar } = req.body;
    if (!author || !quote) {
      return res.status(400).json({ message: 'Name and feedback comment are required.' });
    }
    const db = require('../config/db');
    await db.query(
      `INSERT INTO feedbacks (author, role, company, quote, avatar) VALUES ($1, $2, $3, $4, $5)`,
      [author, role || 'Professional', company || 'Tech Corp', quote, avatar || 'CS']
    );
    res.status(201).json({ message: 'Feedback added successfully!' });
  } catch (err) {
    console.error("Error saving feedback:", err);
    res.status(500).json({ message: 'Failed to save feedback.' });
  }
});

router.get('/feedback', async (req, res) => {
  try {
    const db = require('../config/db');
    const result = await db.query(`SELECT * FROM feedbacks ORDER BY created_at DESC`);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching feedback:", err);
    res.status(500).json({ message: 'Failed to fetch feedback.' });
  }
});

module.exports = router;
