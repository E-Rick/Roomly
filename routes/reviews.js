/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
const express = require('express'),
  router = express.Router({ mergeParams: true }),
  Room = require('../models/room'),
  Review = require('../models/review'),
  middleware = require('../middleware');

// Calculate review average
function calculateAverage(reviews) {
  if (reviews.length === 0) return 0;
  let sum = 0;
  // eslint-disable-next-line no-return-assign
  reviews.forEach(element => (sum += element.rating));
  return sum / reviews.length;
}

// INDEX - Show all reviews
router.get('/', (req, res) => {
  Room.findById(req.params.id)
    .populate({
      path: 'reviews',
      options: { sort: { createdAt: -1 } } // sorting the populated reviews array to show the latest first
    })
    .exec((err, room) => {
      if (err || !room) {
        req.flash('error', err.message);
        return res.redirect('back');
      }
      return res.render('reviews/index', { room });
    });
});

// CREATE - Add new review to database
router.post('/', middleware.isLoggedIn, middleware.checkReviewExistence, (req, res) => {
  // lookup room using ID
  Room.findById(req.params.id)
    .populate('reviews')
    .exec((err, room) => {
      if (err) {
        req.flash('error', err.message);
        return res.redirect('back');
      }
      Review.create(req.body.review, (e, review) => {
        if (e) {
          req.flash('error', e.message);
          return res.redirect('back');
        }
        // add author username/id and associated room to the review
        review.author.id = req.user._id;
        review.author.username = req.user.username;
        review.room = room;
        // save review
        review.save();
        room.reviews.push(review);
        // calculate the new average review for the room
        room.rating = calculateAverage(room.reviews);
        // save room
        room.save();
        req.flash('success', 'Your review has been successfully added.');
        return res.redirect(`/rooms/${room._id}`);
      });
    });
});

// NEW - Show form to create new room
router.get('/new', middleware.isLoggedIn, middleware.checkReviewExistence, (req, res) => {
  // middleware.checkReviewExistence checks if a user already reviewed the room
  // only one review per user is allowed
  Room.findById(req.params.id, (err, room) => {
    if (err) {
      req.flash('error', err.message);
      return res.redirect('back');
    }
    return res.render('reviews/new', { room });
  });
});

// Reviews Edit
router.get('/:review_id/edit', middleware.checkReviewOwnership, (req, res) => {
  Review.findById(req.params.review_id, (err, foundReview) => {
    if (err) {
      req.flash('error', err.message);
      return res.redirect('back');
    }
    return res.render('reviews/edit', { room_id: req.params.id, review: foundReview });
  });
});

// Reviews Update
router.put('/:review_id', middleware.checkReviewOwnership, (req, res) => {
  Review.findByIdAndUpdate(req.params.review_id, req.body.review, { new: true }, err => {
    if (err) {
      req.flash('error', err.message);
      return res.redirect('back');
    }
    Room.findById(req.params.id)
      .populate('reviews')
      .exec((error, room) => {
        if (error) {
          req.flash('error', error.message);
          return res.redirect('back');
        }
        // recalculate room average
        room.rating = calculateAverage(room.reviews);
        // save changes
        room.save();
        req.flash('success', 'Your review was successfully edited.');
        return res.redirect(`/rooms/${room._id}`);
      });
  });
});

// Reviews Delete
router.delete('/:review_id', middleware.checkReviewOwnership, (req, res) => {
  Review.findByIdAndRemove(req.params.review_id, err => {
    if (err) {
      req.flash('error', err.message);
      return res.redirect('back');
    }
    Room.findByIdAndUpdate(req.params.id, { $pull: { reviews: req.params.review_id } }, { new: true })
      .populate('reviews')
      .exec((error, room) => {
        if (error) {
          req.flash('error', error.message);
          return res.redirect('back');
        }
        // recalculate room average
        room.rating = calculateAverage(room.reviews);
        // save changes
        room.save();
        req.flash('success', 'Your review was deleted successfully.');
        return res.redirect(`/rooms/${req.params.id}`);
      });
  });
});

module.exports = router;
