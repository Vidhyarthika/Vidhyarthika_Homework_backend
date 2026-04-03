const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  schoolName: { type: String, required: true, index: true },
}, { timestamps: true });

// Ensure subject names are unique within a school
subjectSchema.index({ name: 1, schoolName: 1 }, { unique: true });

module.exports = mongoose.model('Subject', subjectSchema);
