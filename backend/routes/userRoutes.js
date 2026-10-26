const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');

router.use(protect);

// GET /api/users -> list all users (used for assigning tasks / adding project members)
router.get('/', async (req, res, next) => {
  try {
    const users = await User.find().select('name email role avatar isActive');
    res.json(users);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/users/:id/role -> Admin only, change a user's role
router.patch('/:id/role', authorize('Admin'), async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/users/:id/status -> Admin only, activate/deactivate a user
router.patch('/:id/status', authorize('Admin'), async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
