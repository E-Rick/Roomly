/* eslint-disable consistent-return */
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
      res.render('reviews/index', { room });
    });
});

// CREATE - Add new review to database
router.post('/', middleware.isLoggedIn, middleware.checkReviewExistence, async (req, res) => {
  const room = await Room.findById(req.params.id)
      .populate('reviews')
      .exec(),
    review = await Review.create(req.body.review);
  if (!review.rating) req.flash('error', 'Please fill out the rating');
  // add author username/id and associated room to the review
  review.author.id = req.user._id;
  review.author.username = req.user.username;
  review.room = room;
  review.save();
  room.reviews.push(review);
  room.rating = calculateAverage(room.reviews); // calculate the new average review for the room
  room.save();
  req.flash('success', 'Your review has been successfully added.');
  return res.redirect(`/rooms/${room._id}`);
});

// NEW - Show form to create new review
router.get('/new', middleware.isLoggedIn, middleware.checkReviewExistence, middleware.checkRoom, (req, res) => {
  res.render('reviews/new', { room: req.room });
});

// Reviews Edit
router.get('/:review_id/edit', middleware.checkRoom, middleware.checkReviewOwnership, async (req, res) => {
  res.render('reviews/edit', { room: req.room, review: req.review });
});

// Reviews Update
router.put('/:review_id', middleware.checkReviewOwnership, async (req, res) => {
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
router.delete('/:review_id', middleware.checkReviewOwnership, async (req, res) => {
  await Review.findByIdAndRemove(req.params.review_id);
  const room = await Room.findByIdAndUpdate(req.params.id, { $pull: { reviews: req.params.review_id } }, { new: true })
    .populate('reviews')
    .exec();
  // recalculate room average
  room.rating = calculateAverage(room.reviews);
  room.save();
  req.flash('success', 'Your review was deleted successfully.');
  res.redirect(`/rooms/${req.params.id}`);
});

module.exports = router;
