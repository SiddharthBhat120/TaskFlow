const Task = require('../models/Task');

// @route POST /api/upload/task/:taskId  (multipart/form-data, field name: "file")
exports.uploadTaskFile = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file was uploaded' });

    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const attachment = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: `/uploads/files/${req.file.filename}`,
    };
    task.attachments.push(attachment);
    await task.save();

    res.status(201).json({ message: 'File uploaded successfully', attachment, task });
  } catch (err) {
    next(err);
  }
};
