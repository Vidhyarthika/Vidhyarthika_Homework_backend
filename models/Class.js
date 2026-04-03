const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Class 1"
  section: { type: String }, // e.g., "A"
  schoolName: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Class', classSchema);
