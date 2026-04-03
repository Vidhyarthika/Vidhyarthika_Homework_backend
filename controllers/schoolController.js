const SchoolConfig = require('../models/SchoolConfig');

// @desc    Get school config
// @route   GET /api/school-config
// @access  Private
exports.getSchoolConfig = async (req, res) => {
  try {
    const config = await SchoolConfig.findOne({ schoolName: req.user.schoolName }).lean();
    if (!config) {
      return res.status(404).json({ message: 'School configuration not found' });
    }
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update school config
// @route   PATCH /api/school-config
// @access  Private (Admin)
exports.updateSchoolConfig = async (req, res) => {
  const { principalPhone } = req.body;

  try {
    const config = await SchoolConfig.findOneAndUpdate(
      { schoolName: req.user.schoolName },
      { principalPhone },
      { returnDocument: 'after', upsert: true }
    );

    res.json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
