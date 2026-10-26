const Task = require('../models/Task');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');

// @route GET /api/tasks?project=<id>
exports.getTasks = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.project) filter.project = req.query.project;
    // Team members only see tasks assigned to them unless a project filter (they're a member) is given
    if (req.user.role === 'Team Member' && !req.query.project) {
      filter.assignedTo = req.user._id;
    }

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email')
      .sort({ order: 1, createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    next(err);
  }
};

// @route POST /api/tasks
exports.createTask = async (req, res, next) => {
  try {
    const { title, description, project, assignedTo, priority, deadline } = req.body;
    if (!title || !project) {
      return res.status(400).json({ message: 'Title and project are required' });
    }

    const task = await Task.create({
      title,
      description,
      project,
      assignedTo,
      priority,
      deadline,
      createdBy: req.user._id,
    });

    await Activity.create({
      project,
      user: req.user._id,
      action: `created task "${title}"`,
      entityType: 'task',
    });

    if (assignedTo) {
      await Notification.create({
        user: assignedTo,
        message: `You were assigned a new task: "${title}"`,
        type: 'task_assigned',
        link: `/projects/${project}`,
      });
      // Emit real-time notification if a member is online
      const io = req.app.get('io');
      io.to(`user_${assignedTo}`).emit('notification', {
        message: `You were assigned a new task: "${title}"`,
        type: 'task_assigned',
      });
    }

    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/tasks/:id
exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    Object.assign(task, req.body);
    await task.save();

    await Activity.create({
      project: task.project,
      user: req.user._id,
      action: `updated task "${task.title}"`,
      entityType: 'task',
    });

    res.json(task);
  } catch (err) {
    next(err);
  }
};

// @route PATCH /api/tasks/:id/status  -> used by the Kanban drag-and-drop board
exports.updateTaskStatus = async (req, res, next) => {
  try {
    const { status, order } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    task.status = status;
    if (typeof order === 'number') task.order = order;
    await task.save();

    await Activity.create({
      project: task.project,
      user: req.user._id,
      action: `moved task "${task.title}" to ${status}`,
      entityType: 'task',
    });

    res.json(task);
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/tasks/:id
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
};
