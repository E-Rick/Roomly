const mongoose = require('mongoose'),
  Comment = require('./comment'),
  Review = require('./review');

// SCHEMA SETUP

const roomSchema = new mongoose.Schema({
  name: String,
  price: Number,
  images: [{ url: String, public_id: String }],
  description: String,
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    username: String
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
    }
  ],
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review'
    }
  ],
  rating: {
    type: Number,
    default: 0
  }
});

// Async call to remove comments/reviews if you delete the room
roomSchema.pre('remove', async () => {
  await Comment.deleteMany({
    _id: {
      $in: this.comments
    }
  });
  await Review.deleteMany({
    _id: {
      $in: this.reviews
    }
  });
});

module.exports = mongoose.model('Room', roomSchema);
