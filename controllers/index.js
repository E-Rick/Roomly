/* eslint-disable no-unused-vars */
const passport = require('passport'),
  util = require('util'),
  User = require('../models/user'),
  Room = require('../models/room'),
  { cloudinary } = require('../cloudinary'),
  { deleteProfileImage } = require('../middleware'),
  mapBoxToken = process.env.MAPBOX_TOKEN;

module.exports = {
  async postRegister(req, res, next) {
    try {
      if (req.file) {
        // eslint-disable-next-line camelcase
        const { secure_url, public_id } = req.file;
        req.body.image = {
          secure_url,
          public_id
        };
      }
      const user = await User.register(new User(req.body), req.body.password);
      req.login(user, err => {
        if (err) return res.render('register', { error: err.message });
        passport.authenticate('local');
        req.flash('success', `Successfully signed Up ${user.username}!`);
        return res.redirect('/rooms');
      });
    } catch (err) {
      deleteProfileImage(req);
      const { username, email } = req.body;
      let error = err.message;
      if (error.includes('duplicate') && error.includes('index: email_1 dup key')) {
        error = 'A user with the given email is already registered';
      }
      res.render('register', { title: 'Register', username, email, error });
    }
  },

  getLogin(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect('/');
    }
    if (req.query.returnTo) req.session.redirectTo = req.headers.referer;
    return res.render('login', { page: 'login' });
  },

  postLogin(req, res, next) {
    const redirectUrl = req.session.redirectTo || '/rooms';
    delete req.session.redirectTo;
    passport.authenticate('local', {
      successRedirect: redirectUrl,
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
    try {
      // destructure username and email from req.body
      const { username, email, firstName, lastName } = req.body,
        // destructure user object from res.locals
        { user } = res.locals;
      // check if username or email need to be updated
      if (username) user.username = username;
      if (email) user.email = email;
      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (req.file) {
        if (user.avatar.public_id) await cloudinary.v2.uploader.destroy(user.avatar.public_id);
        // eslint-disable-next-line camelcase
        const { secure_url, public_id } = req.file;
        user.avatar = { secure_url, public_id };
      }
      // save the updated user to the database
      await user.save();
      // promsify req.login
      const login = util.promisify(req.login.bind(req));
      // log the user back in with new info
      await login(user);
      // redirect to /profile with a success flash message
      req.flash('success', 'Profile successfully updated!');
      res.redirect('/profile');
    } catch (err) {
      deleteProfileImage(req);
      const { username, email } = req.body;
      let error = err.message;
      if (error.includes('duplicate') && error.includes('index: email_1 dup key')) {
        error = 'A user with the given email is already registered';
      }
      res.render('profile', { title: 'Edit Profile', username, email, error });
    }
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
