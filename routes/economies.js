const express = require('express');

const economiesController = require('../controllers/economies');

const router = express.Router();

// GET all economies
router.get('/economies', economiesController.getEconomies);

// GET single economy 
router.get('/economies/:tokenAddress', economiesController.getEconomy);

// POST (just for testing with POSTMAN)
router.post('/post', economiesController.postEconomy);

module.exports = router;