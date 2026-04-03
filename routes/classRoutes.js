const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', classController.getClasses);
router.post('/', authorize('ADMIN'), classController.createClass);
router.put('/:id', authorize('ADMIN'), classController.updateClass);
router.delete('/:id', authorize('ADMIN'), classController.deleteClass);

module.exports = router;
