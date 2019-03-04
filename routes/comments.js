/* eslint-disable prefer-const */
/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
const express = require('express'),
  Comment = require('../models/comment.js'),
  middleware = require('../middleware'),
  router = express.Router({ mergeParams: true });

// Comments - New
router.get('/new', middleware.checkRoom, (req, res) => {
  res.render('comments/new', { room: req.room });
});

// Comments - Create
router.post('/', middleware.checkRoom, middleware.isLoggedIn, async (req, res) => {
  // lookup room using ID
  const comment = await Comment.create(req.body.comment);
  // add username and id to comment
  comment.author.id = req.user._id;
  comment.author.username = req.user.username;
  comment.save();
  req.room.comments.push(comment);
  req.room.save();
  req.flash('success', 'Successfully added comment');
  res.redirect(`/rooms/${req.room._id}`);
});

// Comments - Edit
router.get('/:comment_id/edit', middleware.checkRoom, middleware.checkCommentOwnership, async (req, res) => {
  const comment = await Comment.findById(req.params.comment_id);
  res.render('comments/edit', { room_id: req.params.id, comment });
});

// Comments - Update
router.put('/:comment_id', middleware.checkCommentOwnership, async (req, res) => {
  await Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment);
  res.redirect(`/rooms/${req.params.id}`);
});

// Comments - Delete
router.delete('/:comment_id', middleware.checkCommentOwnership, async (req, res) => {
  try {
    await Comment.findByIdAndDelete(req.params.comment_id);
    req.flash('success', 'Comment deleted');
    res.redirect(`/rooms/${req.params.id}`);
  } catch (e) {
    req.flash('error', 'Something went wrong deleting comment');
    res.redirect('back');
  }
});

module.exports = router;
