const express = require('express');
const router = express.Router();
const { getSchoolConfig, updateSchoolConfig } = require('../controllers/schoolController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getSchoolConfig);
router.patch('/', protect, authorize('ADMIN'), updateSchoolConfig);

module.exports = router;
