const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const User = require('../models/User');

// This function wires up all real-time behavior. It is called once from server.js
// with the io instance created from the HTTP server.
module.exports = (io) => {
  // Authenticate every socket connection using the same JWT used for REST calls.
  // The Angular client sends it like: io(url, { auth: { token } })
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication error: no token provided'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('name email role avatar');
      if (!user) return next(new Error('Authentication error: user not found'));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error: invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.user.name} (${socket.id})`);

    // Each user joins a personal room so we can push notifications directly to them
    socket.join(`user_${socket.user._id}`);

    // Join a project's chat room
    socket.on('join_project', (projectId) => {
      socket.join(`project_${projectId}`);
    });

    socket.on('leave_project', (projectId) => {
      socket.leave(`project_${projectId}`);
    });

    // Real-time chat message
    socket.on('send_message', async ({ projectId, text }) => {
      try {
        if (!text || !text.trim()) return;

        const message = await Message.create({
          project: projectId,
          sender: socket.user._id,
          text: text.trim(),
        });

        const payload = {
          _id: message._id,
          project: projectId,
          text: message.text,
          createdAt: message.createdAt,
          sender: { _id: socket.user._id, name: socket.user.name, avatar: socket.user.avatar },
        };

        // Broadcast to everyone in that project's chat room, including the sender
        io.to(`project_${projectId}`).emit('receive_message', payload);
      } catch (err) {
        socket.emit('error_message', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing', ({ projectId }) => {
      socket.to(`project_${projectId}`).emit('user_typing', { name: socket.user.name });
    });
    socket.on('stop_typing', ({ projectId }) => {
      socket.to(`project_${projectId}`).emit('user_stop_typing', { name: socket.user.name });
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.user.name}`);
    });
  });
};
