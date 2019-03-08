/* eslint-disable no-unused-vars */
const express = require('express'),
  passport = require('passport'),
  User = require('../models/user'),
  router = express.Router();

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
  const newUser = new User({ username: req.body.username });
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
    successFlash: 'Welcome back to RoomGenie!'
  })
);

// logout route
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success', 'Successfully logged you out.');
  res.redirect('/rooms');
});

module.exports = router;
