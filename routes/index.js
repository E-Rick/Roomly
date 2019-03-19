/* eslint-disable no-unused-vars */
const router = require('express').Router(),
  passport = require('passport'),
  User = require('../models/user'),
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
router.post('/register', (req, res) => {
  const newUser = new User({
    username: req.body.username,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    avatar: req.body.avatar
  });
  User.register(newUser, req.body.password, (err, user) => {
    if (err) return res.render('register', { error: err.message });
    passport.authenticate('local');
    req.flash('success', `Successfully signed Up ${user.username}!`);
    return res.redirect('/rooms');
  });
});

// show login form
router.get('/login', (req, res) => {
  res.render('login', { page: 'login' });
});

// handling login logic route
router.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/rooms',
    failureRedirect: '/login',
    failureFlash: true,
    successFlash: 'Welcome back to Roomly!'
  })
);

// logout route
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success', 'Successfully logged you out.');
  res.redirect('/rooms');
});

// User profiles
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
