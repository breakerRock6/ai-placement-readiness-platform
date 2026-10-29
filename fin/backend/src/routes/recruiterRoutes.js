const express = require('express');
const router = express.Router();
const { postJob, getMyJobs, getTopCandidates, getJobDetails, updateApplicantStatus, getStudentDetails, updateJob, deleteJob } = require('../controllers/recruiterController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/job', protect, authorize('recruiter'), postJob);
router.get('/jobs', protect, authorize('recruiter'), getMyJobs);
router.get('/job/:jobId', protect, authorize('recruiter'), getJobDetails);
router.put('/job/:jobId', protect, authorize('recruiter'), updateJob);
router.delete('/job/:jobId', protect, authorize('recruiter'), deleteJob);
router.put('/job/:jobId/applicant/:studentId', protect, authorize('recruiter'), updateApplicantStatus);
router.get('/student/:studentId', protect, authorize('recruiter'), getStudentDetails);
router.get('/candidates', protect, authorize('recruiter'), getTopCandidates);

module.exports = router;
