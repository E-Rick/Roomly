const mongoose = require('mongoose'),
  passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new mongoose.Schema(
  {
    avatar: {
      secure_url: { type: String, default: '/images/placeholder@roomly.png' },
      public_id: String
    },
    firstName: String,
    lastName: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    email: { type: String, unique: true, required: true },
    isAdmin: { type: Boolean, default: false }
  },
  {
    // if timestamps are set to true, mongoose assigns createdAt and
    // updatedAt fields to your schema, the type assigned is Date.
    timestamps: { createdAt: true, updatedAt: false }
  }
);

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);
