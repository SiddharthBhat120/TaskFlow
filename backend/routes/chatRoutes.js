const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getMessages } = require('../controllers/chatController');

router.use(protect);
router.get('/:projectId', getMessages);

module.exports = router;
