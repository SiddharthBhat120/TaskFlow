const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getTasks,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
} = require('../controllers/taskController');

router.use(protect);

router.get('/', getTasks);
router.post('/', authorize('Admin', 'Project Manager'), createTask);
router.put('/:id', updateTask);
router.patch('/:id/status', updateTaskStatus); // anyone assigned can drag their own task across the board
router.delete('/:id', authorize('Admin', 'Project Manager'), deleteTask);

module.exports = router;
