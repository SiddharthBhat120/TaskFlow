const Message = require('../models/Message');

// @route GET /api/chat/:projectId  -> load chat history when a user opens a project's chat room
exports.getMessages = async (req, res, next) => {
  try {
    const messages = await Message.find({ project: req.params.projectId })
      .populate('sender', 'name avatar')
      .sort({ createdAt: 1 })
      .limit(200);
    res.json(messages);
  } catch (err) {
    next(err);
  }
};
