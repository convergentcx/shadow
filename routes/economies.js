const express = require('express');

const economiesController = require('../controllers/economies');

const router = express.Router();

// GET /feed/posts
// router.get('/economies', economiesController.getEconomies);

// POST /feed/post
router.post('/post', economiesController.postEconomy);

module.exports = router;