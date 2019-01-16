const express = require('express');

const economiesController = require('../controllers/economies');

const router = express.Router();

// GET
router.get('/economies', economiesController.getEconomies);

// POST
router.post('/post', economiesController.postEconomy);

module.exports = router;