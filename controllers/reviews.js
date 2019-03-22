/* eslint-disable no-unused-vars */
/* eslint-disable object-curly-newline */
/* eslint-disable consistent-return */
const Room = require('../models/room'),
  Review = require('../models/review');

// Calculate review average
function calculateAverage(reviews) {
  if (reviews.length === 0) return 0;
  let sum = 0;
  // eslint-disable-next-line no-return-assign
  reviews.forEach(element => (sum += element.rating));
  return sum / reviews.length;
}

module.exports = {
  async reviewIndex(req, res, next) {
    await Room.findById(req.params.id)
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
  },

  reviewNew(req, res, next) {
    res.render('reviews/new', { room: req.room });
  },

  async reviewCreate(req, res, next) {
    const room = await Room.findById(req.params.id)
      .populate('reviews')
      .exec();
    try {
      const review = await Review.create(req.body.review);
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
    } catch (e) {
      req.flash('error', 'Please fill out the rating');
      res.redirect('back');
    }
  },

  reviewEdit(req, res, next) {
    res.render('reviews/edit', { room: req.room, review: req.review });
  },

  async reviewUpdate(req, res, next) {
    await Review.findByIdAndUpdate(req.params.review_id, req.body.review, { new: true });
    const room = await Room.findById(req.params.id)
      .populate('reviews')
      .exec();
    // recalculate room average
    room.rating = calculateAverage(room.reviews);
    room.save();
    req.flash('success', 'Your review was successfully edited.');
    res.redirect(`/rooms/${room._id}`);
  },

  async deleteReview(req, res, next) {
    await Review.findByIdAndRemove(req.params.review_id);
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { $pull: { reviews: req.params.review_id } },
      { new: true }
    )
      .populate('reviews')
      .exec();
    // recalculate room average
    room.rating = calculateAverage(room.reviews);
    room.save();
    req.flash('success', 'Your review was deleted successfully.');
    res.redirect(`/rooms/${req.params.id}`);
  }
};
