const User = require('../models/User');
const jwt = require('jsonwebtoken');

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
exports.loginUser = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username })
      .populate('assignedSubjects', 'name')
      .populate('assignedClasses', 'name section')
      .populate('classId', 'name section')
      .lean();

    if (!user || !(await User.prototype.comparePassword.call(user, password))) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const response = {
      _id: user._id,
      username: user.username,
      name: user.name,
      role: user.role,
      schoolName: user.schoolName,
      token: jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '365d' }),
    };

    if (user.role === 'TEACHER') {
      response.assignedSubjects = user.assignedSubjects || [];
      response.assignedClasses  = user.assignedClasses  || [];
    }
    if (user.role === 'STUDENT') {
      response.classId = user.classId || null;
    }

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bulk create users
// @route   POST /api/users/init
// @access  Private/Admin
exports.bulkInitUsers = async (req, res) => {
  const { users } = req.body;
  if (!Array.isArray(users)) {
    return res.status(400).json({ message: 'Expected an array of users' });
  }
  try {
    const createdUsers = [];
    for (const userData of users) {
      const userExists = await User.findOne({ username: userData.username });
      if (!userExists) {
        const user = new User(userData);
        await user.save();
        createdUsers.push(user.username);
      }
    }
    res.status(201).json({
      message: 'Bulk initialization complete',
      processed: createdUsers.length,
      users: createdUsers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create single user
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = async (req, res) => {
  const { username, name, password, role, classId, schoolName, assignedSubjects, assignedClasses } = req.body;
  try {
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const user = await User.create({
      username, name, password, role, classId,
      assignedSubjects, assignedClasses, schoolName,
    });
    res.status(201).json({ _id: user._id, username: user.username, name: user.name, role: user.role });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users with pagination + optional role/class filter
// @route   GET /api/users?page=1&limit=20&role=STUDENT&classId=xxx
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const { page, limit, role, classId } = req.query;
    const PAGE_SIZE = parseInt(limit) || 20;
    const pageNum   = parseInt(page)  || 1;
    const skip      = (pageNum - 1) * PAGE_SIZE;
 
    // Build filter — always scoped to admin's school
    const filter = { schoolName: req.user.schoolName };
    if (role)    filter.role    = role;
    if (classId) filter.classId = classId;
 
    // Parallel fetch — page data + total count
    const [users, total] = await Promise.all([
      User.find(filter)
        .populate('assignedSubjects', 'name')
        .populate('assignedClasses', 'name section')
        .populate('classId', 'name section')
        .select('-password')
        .sort({ name: 1 })
        .skip(skip)
        .limit(PAGE_SIZE)
        .lean(),
      User.countDocuments(filter),
    ]);
 
    res.json({
      users,
      total,
      page:    pageNum,
      pages:   Math.ceil(total / PAGE_SIZE),
      hasNext: pageNum * PAGE_SIZE < total,
      hasPrev: pageNum > 1,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id, req.body, { returnDocument: 'after' }
    ).select('-password');
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Change own password
// @route   PATCH /api/users/me/password
// @access  Private
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};