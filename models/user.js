const mongoose = require('mongoose'),
  passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new mongoose.Schema(
  {
    username: String,
    password: String,
    avatar: String,
    firstName: String,
    lastName: String,
    email: String,
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
