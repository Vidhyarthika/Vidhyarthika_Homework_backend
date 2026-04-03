const express = require('express');
const router = express.Router();
const { loginUser, bulkInitUsers, createUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.post('/login', loginUser);
router.post('/init', protect, authorize('ADMIN'), bulkInitUsers);
router.patch('/me/password', protect, require('../controllers/userController').changePassword);
router.post('/', protect, authorize('ADMIN'), createUser);
router.get('/', protect, authorize('ADMIN'), require('../controllers/userController').getAllUsers);
router.put('/:id', protect, authorize('ADMIN'), require('../controllers/userController').updateUser);
router.delete('/:id', protect, authorize('ADMIN'), require('../controllers/userController').deleteUser);

module.exports = router;
