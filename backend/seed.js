// Run with: node seed.js
// This creates sample users, a project, and tasks so you have data to test with right away.
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB for seeding...');

  await Promise.all([User.deleteMany({}), Project.deleteMany({}), Task.deleteMany({})]);

  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@taskflow.com',
    password: 'password123',
    role: 'Admin',
  });

  const manager = await User.create({
    name: 'Priya Manager',
    email: 'manager@taskflow.com',
    password: 'password123',
    role: 'Project Manager',
  });

  const member1 = await User.create({
    name: 'Rahul Member',
    email: 'rahul@taskflow.com',
    password: 'password123',
    role: 'Team Member',
  });

  const member2 = await User.create({
    name: 'Sneha Member',
    email: 'sneha@taskflow.com',
    password: 'password123',
    role: 'Team Member',
  });

  const project = await Project.create({
    name: 'TaskFlow Website Redesign',
    description: 'Redesign the company website with a modern, responsive UI.',
    status: 'Active',
    priority: 'High',
    manager: manager._id,
    members: [manager._id, member1._id, member2._id],
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    createdBy: manager._id,
  });

  await Task.insertMany([
    {
      title: 'Design login page UI',
      description: 'Create wireframes and Figma design for login/register screens.',
      project: project._id,
      assignedTo: member1._id,
      createdBy: manager._id,
      status: 'To Do',
      priority: 'High',
    },
    {
      title: 'Set up Angular project',
      description: 'Initialize Angular 19 project with Material and routing.',
      project: project._id,
      assignedTo: member1._id,
      createdBy: manager._id,
      status: 'In Progress',
      priority: 'Medium',
    },
    {
      title: 'Build REST API for tasks',
      description: 'Implement CRUD endpoints for tasks with role-based access.',
      project: project._id,
      assignedTo: member2._id,
      createdBy: manager._id,
      status: 'Review',
      priority: 'High',
    },
    {
      title: 'Write project documentation',
      description: 'Document setup steps and API endpoints.',
      project: project._id,
      assignedTo: member2._id,
      createdBy: manager._id,
      status: 'Completed',
      priority: 'Low',
    },
  ]);

  console.log('Seed data created successfully!');
  console.log('----------------------------------------');
  console.log('Login credentials (password for all: password123):');
  console.log('Admin:   admin@taskflow.com');
  console.log('Manager: manager@taskflow.com');
  console.log('Member:  rahul@taskflow.com');
  console.log('Member:  sneha@taskflow.com');
  console.log('----------------------------------------');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
