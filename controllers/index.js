/* eslint-disable no-unused-vars */
const passport = require('passport'),
  util = require('util'),
  User = require('../models/user'),
  Room = require('../models/room'),
  mapBoxToken = process.env.MAPBOX_TOKEN;

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

  async updateProfile(req, res, next) {
    // destructure username and email from req.body
    const { username, email, firstName, lastName } = req.body,
      // destructure user object from res.locals
      { user } = res.locals;
    // check if username or email need to be updated
    if (username) user.username = username;
    if (email) user.email = email;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    // save the updated user to the database
    await user.save();
    // promsify req.login
    const login = util.promisify(req.login.bind(req));
    // log the user back in with new info
    await login(user);
    // redirect to /profile with a success flash message
    req.flash('success', 'Profile successfully updated!');
    res.redirect('/profile');
  },

  async getUser(req, res, next) {
    const user = await User.findById(req.params.id),
      rooms = await Room.find()
        .where('author.id')
        .equals(user._id)
        .limit(4)
        .exec();
    res.render('users/show', { user, rooms });
  }
};
