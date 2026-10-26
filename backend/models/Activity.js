const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true }, // e.g. "created task 'Design Login Page'"
    entityType: { type: String, enum: ['project', 'task', 'chat', 'file'], default: 'task' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Activity', activitySchema);
