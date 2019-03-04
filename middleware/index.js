/* eslint-disable consistent-return */
/* eslint-disable no-lonely-if */
// all the middleware goes here
const Room = require('../models/room'),
  Comment = require('../models/comment'),
  Review = require('../models/review');

const middlewareObj = {};

middlewareObj.checkRoomOwnership = (req, res, next) => {
  // is user logged in?
  if (req.isAuthenticated()) {
    Room.findById(req.params.id, (err, foundRoom) => {
      if (err || !foundRoom) {
        req.flash('error', 'Room not found check room ownership');
        res.redirect('/rooms');
      } else {
        // does user own the room?
        // have to use .equals because foundroom is a mongoose obj not string
        if (foundRoom.author.id.equals(req.user._id) || req.user.isAdmin) {
          req.room = foundRoom;
          next();
        } else {
          req.flash('error', 'You do not have permission to do that!');
          res.redirect('/rooms');
        }
      }
    });
  } else {
    // if not, redirect
    req.flash('error', 'You need to be logged in to do that');
    res.redirect('/login');
  }
};

// Checks database for existance of room else returns err
// Passes valid room object through
middlewareObj.checkRoom = (req, res, next) => {
  Room.findById(req.params.id, (err, foundRoom) => {
    if (err || !foundRoom) {
      req.flash('error', 'Sorry, no room found with that ID!');
      return res.redirect('/rooms');
    }
    req.room = foundRoom; // send valid room to req for next
    next();
  });
};

middlewareObj.checkCommentOwnership = (req, res, next) => {
  // is user logged in?
  if (req.isAuthenticated()) {
    Comment.findById(req.params.comment_id, (err, foundComment) => {
      if (err || !foundComment) {
        req.flash('error', 'Comment not found');
        res.redirect('/rooms');
      } else {
        // does user own the comment
        // have to use .equals because foundcomment is a mongoose obj not string
        if (foundComment.author.id.equals(req.user._id) || req.user.isAdmin) next();
        else {
          req.flash('error', 'You do not have permission to do that!');
          res.redirect('/rooms');
        }
      }
    });
  } else {
    // if not, redirect
    req.flash('error', 'You need to be logged in to do that');
    res.redirect('/rooms');
  }
};

middlewareObj.checkReviewOwnership = (req, res, next) => {
  if (req.isAuthenticated()) {
    Review.findById(req.params.review_id, (err, foundReview) => {
      if (err || !foundReview) {
        res.redirect('back');
      } else {
        // does user own the comment?
        if (foundReview.author.id.equals(req.user._id) || req.user.isAdmin) {
          next();
        } else {
          req.flash('error', "You don't have permission to do that");
          res.redirect('back');
        }
      }
    });
  } else {
    req.flash('error', 'You need to be logged in to do that');
    res.redirect('back');
  }
};

middlewareObj.checkReviewExistence = (req, res, next) => {
  if (req.isAuthenticated()) {
    Room.findById(req.params.id)
      .populate('reviews')
      .exec((err, foundRoom) => {
        if (err || !foundRoom) {
          req.flash('error', 'Room not found.');
          return res.redirect('back');
        }
        // check if req.user._id exists in foundRoom.reviews
        const foundUserReview = foundRoom.reviews.some(review => review.author.id.equals(req.user._id));
        if (foundUserReview) {
          req.flash('error', 'You already wrote a review.');
          return res.redirect(`/rooms/${foundRoom._id}`);
        }
        // if the review was not found, go to the next middleware
        next();
      });
  } else {
    req.flash('error', 'You need to login first.');
    res.redirect('back');
  }
};

middlewareObj.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  // flash before redirect so it displays on the next page
  req.flash('error', 'You need to be logged in to do that!');
  res.redirect('/login');
};

module.exports = middlewareObj;
