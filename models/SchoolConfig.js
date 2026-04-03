const mongoose = require('mongoose');

const schoolConfigSchema = new mongoose.Schema({
  schoolName: { type: String, required: true, unique: true },
  principalPhone: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('SchoolConfig', schoolConfigSchema);
