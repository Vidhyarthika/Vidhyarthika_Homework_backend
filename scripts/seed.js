require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Class = require('../models/Class');
const SchoolConfig = require('../models/SchoolConfig');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clean up
    await User.deleteMany({});
    await Class.deleteMany({});
    await SchoolConfig.deleteMany({});

    // Create Initial Classes
    const class1 = await Class.create({ name: 'Class 1', section: 'A', schoolName: 'Vidhyarthika' });
    const class2 = await Class.create({ name: 'Class 2', section: 'B', schoolName: 'Vidhyarthika' });

    // Create School Config
    await SchoolConfig.create({ schoolName: 'Vidhyarthika', principalPhone: '9876543210' });

    // Create Users
    const users = [
      {
        username: 'avineshmtp@gmail.com',
        password: 'Admin123@',
        role: 'ADMIN',
        schoolName: 'Vidhyarthika'
      },
      {
        username: 'abishek.cs21@bitsathy.ac.in',
        password: 'Teacher123@',
        role: 'TEACHER',
        schoolName: 'Vidhyarthika',
        classId: class1._id
      },
      {
        username: 'abishekriya0108@gmail.com',
        password: 'Student123@',
        role: 'STUDENT',
        schoolName: 'Vidhyarthika',
        classId: class1._id
      }
    ];

    for (const u of users) {
      const user = new User(u);
      await user.save();
    }

    console.log('Seeding successful!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message || error);
    process.exit(1);
  }
};

seed();
