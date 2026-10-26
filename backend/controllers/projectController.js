const Project = require('../models/Project');
const Task = require('../models/Task');
const Activity = require('../models/Activity');

// @route GET /api/projects
// Admin sees all projects. PM sees projects they manage. Team Member sees projects they're a member of.
exports.getProjects = async (req, res, next) => {
  try {
    let filter = {};
    if (req.user.role === 'Project Manager') {
      filter = { $or: [{ manager: req.user._id }, { members: req.user._id }] };
    } else if (req.user.role === 'Team Member') {
      filter = { members: req.user._id };
    }

    const projects = await Project.find(filter)
      .populate('manager', 'name email avatar')
      .populate('members', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (err) {
    next(err);
  }
};

// @route GET /api/projects/:id
exports.getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('manager', 'name email avatar')
      .populate('members', 'name email avatar');

    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    next(err);
  }
};

// @route POST /api/projects  (Admin, Project Manager)
exports.createProject = async (req, res, next) => {
  try {
    const { name, description, priority, deadline, members } = req.body;
    if (!name) return res.status(400).json({ message: 'Project name is required' });

    const project = await Project.create({
      name,
      description,
      priority,
      deadline,
      members: members || [],
      manager: req.user.role === 'Project Manager' ? req.user._id : req.body.manager || req.user._id,
      createdBy: req.user._id,
    });

    await Activity.create({
      project: project._id,
      user: req.user._id,
      action: `created the project "${project.name}"`,
      entityType: 'project',
    });

    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/projects/:id
exports.updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const isAllowed =
      req.user.role === 'Admin' || String(project.manager) === String(req.user._id);
    if (!isAllowed) {
      return res.status(403).json({ message: 'Only the project manager or an admin can edit this project' });
    }

    Object.assign(project, req.body);
    await project.save();

    await Activity.create({
      project: project._id,
      user: req.user._id,
      action: `updated the project "${project.name}"`,
      entityType: 'project',
    });

    res.json(project);
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/projects/:id  (Admin, or the managing PM)
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const isAllowed =
      req.user.role === 'Admin' || String(project.manager) === String(req.user._id);
    if (!isAllowed) {
      return res.status(403).json({ message: 'Not allowed to delete this project' });
    }

    await Task.deleteMany({ project: project._id });
    await project.deleteOne();

    res.json({ message: 'Project and its tasks were deleted' });
  } catch (err) {
    next(err);
  }
};
