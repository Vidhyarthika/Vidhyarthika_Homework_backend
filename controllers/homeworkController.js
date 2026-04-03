const Homework = require('../models/Homework');

// @desc    Create homework
// @route   POST /api/homework
// @access  Private (Admin/Teacher)
exports.createHomework = async (req, res) => {
  const { classId, subjectId, title, description, date } = req.body;

  try {
    // If Teacher, check if they are authorized for this class and subject
    if (req.user.role === 'TEACHER') {
      const isClassAssigned = req.user.assignedClasses.includes(classId);
      const isSubjectAssigned = req.user.assignedSubjects.some(id => id.toString() === subjectId);
      
      if (!isClassAssigned || !isSubjectAssigned) {
        return res.status(403).json({ 
          message: 'You are not assigned to this class or subject.' 
        });
      }
    }

    const homework = await Homework.create({
      classId,
      subjectId,
      teacherId: req.user._id,
      schoolName: req.user.schoolName,
      title,
      description,
      date: new Date(date),
    });

    res.status(201).json(homework);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get homework by class with date range
// @route   GET /api/homework/:classId
// @access  Private
exports.getHomeworkByClass = async (req, res) => {
  const { classId } = req.params;
  const { startDate, endDate, subjectId } = req.query;

  try {
    let query = { classId };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    if (subjectId) {
      query.subjectId = subjectId;
    }

    const homework = await Homework.find(query)
      .populate('subjectId', 'name')
      .populate('teacherId', 'name')
      .sort({ date: -1 })
      .lean();

    res.json(homework);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateHomework = async (req, res) => {
  try {
    const updatedHomework = await Homework.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    res.json(updatedHomework);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteHomework = async (req, res) => {
  try {
    await Homework.findByIdAndDelete(req.params.id);
    res.json({ message: 'Homework deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get homework statistics for Admin
// @route   GET /api/homework/admin/stats
// @access  Private (Admin)
exports.getHomeworkStats = async (req, res) => {
  try {
    const schoolName = req.user.schoolName;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const totalHomework = await Homework.countDocuments({ schoolName });
    const recentHomework = await Homework.countDocuments({ 
      schoolName, 
      createdAt: { $gte: sevenDaysAgo } 
    });

    const bySubject = await Homework.aggregate([
      { $match: { schoolName } },
      { $group: { _id: '$subjectId', count: { $sum: 1 } } },
      { $lookup: { from: 'subjects', localField: '_id', foreignField: '_id', as: 'subject' } },
      { $unwind: '$subject' },
      { $project: { name: '$subject.name', count: 1, _id: 0 } }
    ]);

    res.json({
      total: totalHomework,
      recent: recentHomework,
      bySubject
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
