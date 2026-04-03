const mongoose = require('mongoose');

const homeworkSchema = new mongoose.Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },  
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
teacherId: { 
  type: mongoose.Schema.Types.ObjectId, 
  ref: 'User', 
  required: true 
},
  schoolName: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true }
}, { timestamps: true });

// Requested Indexes for performance
homeworkSchema.index({ classId: 1, date: -1 });
homeworkSchema.index({ schoolName: 1 });

module.exports = mongoose.model('Homework', homeworkSchema);
