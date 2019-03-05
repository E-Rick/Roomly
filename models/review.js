const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      required: 'Please provide a rating (1-5 stars).',
      min: 1,
      max: 5,
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an integer value.'
      }
    },
    text: {
      type: String
    },
    author: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      username: String
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room'
    }
  },
  {
    // if timestamps are set to true, mongoose assigns createdAt and
    // updatedAt fields to your schema, the type assigned is Date.
    timestamps: true
  }
);

module.exports = mongoose.model('Review', reviewSchema);
