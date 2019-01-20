const express = require('express');

const usersController = require('../controllers/users');

const router = express.Router();

// GET all users
// router.get('/users', usersController.getUsers);

// GET single user
router.get('/users/:publicAddress', usersController.getUser);

// POST new user
router.post('/users/:publicAddress', usersController.postUser);

// authorize + authenticate user
router.post('/auth', usersController.authUser);


module.exports = router;