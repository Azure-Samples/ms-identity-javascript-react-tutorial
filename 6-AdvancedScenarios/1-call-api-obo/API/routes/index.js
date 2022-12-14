const express = require('express');

const profile = require('../controllers/profile');

// initialize router
const router = express.Router();

router.get('/profile', profile.getProfile);

module.exports = router;