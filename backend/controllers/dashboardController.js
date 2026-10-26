const Project = require('../models/Project');
const Task = require('../models/Task');
const Activity = require('../models/Activity');
const User = require('../models/User');

// @route GET /api/dashboard/summary
// Returns numbers used for the dashboard cards and Chart.js graphs
exports.getSummary = async (req, res, next) => {
  try {
    const isElevated = req.user.role === 'Admin' || req.user.role === 'Project Manager';

    const projectFilter = isElevated
      ? {}
      : { members: req.user._id };
    const taskFilter = isElevated ? {} : { assignedTo: req.user._id };

    const [totalProjects, activeProjects, totalTasks, tasksByStatus, tasksByPriority, totalUsers] =
      await Promise.all([
        Project.countDocuments(projectFilter),
        Project.countDocuments({ ...projectFilter, status: 'Active' }),
        Task.countDocuments(taskFilter),
        Task.aggregate([
          { $match: taskFilter },
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
        Task.aggregate([
          { $match: taskFilter },
          { $group: { _id: '$priority', count: { $sum: 1 } } },
        ]),
        isElevated ? User.countDocuments() : Promise.resolve(null),
      ]);

    // Normalize aggregation results into a flat object, e.g. { 'To Do': 4, 'In Progress': 2 }
    const statusMap = { 'To Do': 0, 'In Progress': 0, Review: 0, Completed: 0 };
    tasksByStatus.forEach((s) => (statusMap[s._id] = s.count));

    const priorityMap = { Low: 0, Medium: 0, High: 0 };
    tasksByPriority.forEach((p) => (priorityMap[p._id] = p.count));

    res.json({
      totalProjects,
      activeProjects,
      totalTasks,
      completedTasks: statusMap.Completed,
      totalUsers,
      tasksByStatus: statusMap,
      tasksByPriority: priorityMap,
    });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/dashboard/activity?project=<id>  -> activity timeline feed
exports.getActivity = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.project) filter.project = req.query.project;

    const activities = await Activity.find(filter)
      .populate('user', 'name avatar')
      .populate('project', 'name')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(activities);
  } catch (err) {
    next(err);
  }
};
