/* eslint-disable object-curly-newline */
/* eslint-disable consistent-return */
const express = require('express'),
  router = express.Router({ mergeParams: true }),
  Room = require('../models/room'),
  Review = require('../models/review'),
  { getReviews, postReview, deleteReview } = require('../controllers/reviews'),
  { asyncErrorHandler, isLoggedIn, checkReviewExistence, checkReviewOwnership, checkRoom } = require('../middleware');

// Calculate review average
function calculateAverage(reviews) {
  if (reviews.length === 0) return 0;
  let sum = 0;
  // eslint-disable-next-line no-return-assign
  reviews.forEach(element => (sum += element.rating));
  return sum / reviews.length;
}

// INDEX - Show all reviews
router.get('/', asyncErrorHandler(getReviews));

// CREATE - Add new review to database
router.post('/', isLoggedIn, checkReviewExistence, asyncErrorHandler(postReview));

// NEW - Show form to create new review
router.get('/new', isLoggedIn, checkReviewExistence, checkRoom, (req, res) => {
  res.render('reviews/new', { room: req.room });
});

// Reviews Edit
router.get('/:review_id/edit', checkRoom, checkReviewOwnership, async (req, res) => {
  res.render('reviews/edit', { room: req.room, review: req.review });
});

// Reviews Update
router.put('/:review_id', checkReviewOwnership, async (req, res) => {
  await Review.findByIdAndUpdate(req.params.review_id, req.body.review, { new: true });
  const room = await Room.findById(req.params.id)
    .populate('reviews')
    .exec();
  // recalculate room average
  room.rating = calculateAverage(room.reviews);
  room.save();
  req.flash('success', 'Your review was successfully edited.');
  res.redirect(`/rooms/${room._id}`);
});

// Reviews Delete
router.delete('/:review_id', checkReviewOwnership, asyncErrorHandler(deleteReview));

module.exports = router;
