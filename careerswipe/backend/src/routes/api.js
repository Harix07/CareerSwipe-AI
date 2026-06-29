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

module.exports = router;
