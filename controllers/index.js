/* eslint-disable no-unused-vars */
const passport = require('passport'),
  User = require('../models/user'),
  Room = require('../models/room');

module.exports = {
  async postRegister(req, res, next) {
    const newUser = new User({
      username: req.body.username,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      avatar: req.body.avatar
    });
    await User.register(newUser, req.body.password, (err, user) => {
      if (err) return res.render('register', { error: err.message });
      passport.authenticate('local');
      req.flash('success', `Successfully signed Up ${user.username}!`);
      return res.redirect('/rooms');
    });
  },

  postLogin(req, res, next) {
    passport.authenticate('local', {
      successRedirect: '/rooms',
      failureRedirect: '/login',
      failureFlash: true,
      successFlash: 'Welcome back to Roomly!'
    })(req, res, next);
  },

  getLogout(req, res, next) {
    req.logout();
    req.flash('success', 'Successfully logged you out.');
    res.redirect('/rooms');
  },

  async getProfile(req, res, next) {
    res.render('profile', { user: req.user });
  },

  async getUser(req, res, next) {
    const user = await User.findById(req.params.id),
      rooms = await Room.find()
        .where('author')
        .equals(user._id)
        .limit(4)
        .exec();
    res.render('users/show', { user, rooms });
  }
};
