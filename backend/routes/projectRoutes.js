const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');

router.use(protect); // every route below requires a logged-in user

router.get('/', getProjects);
router.get('/:id', getProject);
router.post('/', authorize('Admin', 'Project Manager'), createProject);
router.put('/:id', authorize('Admin', 'Project Manager'), updateProject);
router.delete('/:id', authorize('Admin', 'Project Manager'), deleteProject);

module.exports = router;
