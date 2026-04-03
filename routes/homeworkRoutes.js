const express = require('express');
const router = express.Router();
const { createHomework, getHomeworkByClass } = require('../controllers/homeworkController');
const { protect, authorize } = require('../middleware/auth');

router.get('/admin/stats', protect, authorize('ADMIN'), require('../controllers/homeworkController').getHomeworkStats);
router.get('/:classId', protect, getHomeworkByClass);
router.post('/', protect, authorize('ADMIN', 'TEACHER'), createHomework);
router.put('/:id', protect, authorize('ADMIN', 'TEACHER'), require('../controllers/homeworkController').updateHomework);
router.delete('/:id', protect, authorize('ADMIN', 'TEACHER'), require('../controllers/homeworkController').deleteHomework);

module.exports = router;
