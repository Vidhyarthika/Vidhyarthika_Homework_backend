const express = require('express');
const router = express.Router();
const { getSubjects, createSubject, updateSubject, deleteSubject } = require('../controllers/subjectController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', getSubjects);
router.post('/', authorize('ADMIN'), createSubject);
router.put('/:id', authorize('ADMIN'), updateSubject);
router.delete('/:id', authorize('ADMIN'), deleteSubject);

module.exports = router;
