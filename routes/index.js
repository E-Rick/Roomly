/* eslint-disable no-unused-vars */
const router = require('express').Router(),
  User = require('../models/user'),
  { asyncErrorHandler, isLoggedIn } = require('../middleware'),
  { postRegister, postLogin, getLogout, getProfile } = require('../controllers'),
  Room = require('../models/room');

// Root route
router.get('/', (req, res) => {
  res.render('landing');
});

// show register form
router.get('/register', (req, res) => {
  res.render('register', { page: 'register' });
});

// Handle signup logic route
router.post('/register', asyncErrorHandler(postRegister));

// show login form
router.get('/login', (req, res) => {
  res.render('login', { page: 'login' });
});

// handling login logic route
router.post('/login', postLogin);

// logout route
router.get('/logout', getLogout);

// User profiles
router.get('/profile', isLoggedIn, asyncErrorHandler(getProfile));

router.get('/users/:id', (req, res) => {
  User.findById(req.params.id, (err, foundUser) => {
    if (err) {
      req.flash('error', 'user not found');
      res.redirect('/rooms');
    }
    Room.find()
      .where('author.id')
      .equals(foundUser._id)
      .exec((error, rooms) => {
        if (error) {
          req.flash('error', 'user not found');
          res.redirect('/rooms');
        }
        res.render('users/show', { user: foundUser, rooms });
      });
  });
});

module.exports = router;
