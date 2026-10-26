const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getSummary, getActivity } = require('../controllers/dashboardController');

router.use(protect);
router.get('/summary', getSummary);
router.get('/activity', getActivity);

module.exports = router;
