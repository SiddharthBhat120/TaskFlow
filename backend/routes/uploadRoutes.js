const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadTaskFile } = require('../controllers/uploadController');

router.use(protect);
router.post('/task/:taskId', upload.single('file'), uploadTaskFile);

module.exports = router;
