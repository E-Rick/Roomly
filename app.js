/* eslint-disable comma-dangle */
require('dotenv').config();

const express = require('express'),
  app = express(),
  bodyParser = require('body-parser'),
  cookieParser = require('cookie-parser'),
  mongoose = require('mongoose'),
  flash = require('connect-flash'),
  passport = require('passport'),
  LocalStrategy = require('passport-local'),
  methodOverride = require('method-override'),
  User = require('./models/user'),
  seedDB = require('./seeds');

// Requiring routes
const commentRoutes = require('./routes/comments'),
  roomRoutes = require('./routes/rooms'),
  reviewRoutes = require('./routes/reviews'),
  indexRoutes = require('./routes/index');

mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useFindAndModify: false
});

app.use(bodyParser.urlencoded({ extended: true, useNewUrlParser: true }));
app.set('view engine', 'ejs');
app.use(express.static(`${__dirname}/public`));
app.use(methodOverride('_method'));
app.use(flash());
app.use(cookieParser());
// seedDB(); // Seed the database

// PASSPORT CONFIGURATION
app.use(
  require('express-session')({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// makes the currentUser available to all templates
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  next();
});

// Use of the express router
// first param adds prefix to all routes of that file
app.use('/', indexRoutes);
app.use('/rooms', roomRoutes);
app.use('/rooms/:id/reviews', reviewRoutes);
app.use('/rooms/:id/comments', commentRoutes);
app.use((req, res) => {
  res.redirect('/');
});

app.listen(process.env.PORT, () => {
  console.log('Roomly server has started');
});
