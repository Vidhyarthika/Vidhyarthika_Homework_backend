const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  name: { type: String },
  password: { type: String, required: true },
  role: { 
    type: String, 
    required: true, 
    enum: ['ADMIN', 'TEACHER', 'STUDENT'] 
  },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' }, // For Students
  assignedSubjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }], // For Teachers
  assignedClasses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }], // Array of Class IDs for Teachers
  schoolName: { type: String, required: true }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
