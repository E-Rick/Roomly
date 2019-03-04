/* eslint-disable prefer-const */
/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
const express = require('express'),
  Room = require('../models/room.js'),
  Comment = require('../models/comment.js'),
  middleware = require('../middleware'),
  router = express.Router({ mergeParams: true });

const noRoomFound = 'No room found with that ID.';

// Comments - New
router.get('/new', middleware.checkRoom, (req, res) => {
  res.render('comments/new', { room: req.room });
});

// Comments - Create
router.post('/', middleware.isLoggedIn, async (req, res) => {
  // lookup room using ID
  try {
    const room = await Room.findById(req.params.id),
      comment = await Comment.create(req.body.comment);
    // add username and id to comment
    comment.author.id = req.user._id;
    comment.author.username = req.user.username;
    // save comment
    comment.save();
    room.comments.push(comment);
    room.save();
    req.flash('success', 'Successfully added comment');
    res.redirect(`/rooms/${room._id}`);
  } catch (e) {
    req.flash('error', noRoomFound);
    res.redirect('/rooms');
  }
});

// Comments - Edit
router.get('/:comment_id/edit', middleware.checkCommentOwnership, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) throw new Error(noRoomFound);
    const comment = await Comment.findById(req.params.comment_id);
    res.render('comments/edit', { room_id: req.params.id, comment });
  } catch (e) {
    req.flash('error', noRoomFound);
    res.redirect('/rooms');
  }
});

// Comments - Update
router.put('/:comment_id', middleware.checkCommentOwnership, (req, res) => {
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, err => {
    if (err) res.redirect('back');
    else res.redirect(`/rooms/${req.params.id}`);
  });
});

// Comments - Delete
router.delete('/:comment_id', middleware.checkCommentOwnership, (req, res) => {
  Comment.findByIdAndDelete(req.params.comment_id, err => {
    if (err) {
      req.flash('error', 'Something went wrong');
      res.redirect('back');
    } else {
      req.flash('success', 'Comment deleted');
      res.redirect(`/rooms/${req.params.id}`);
    }
  });
});

module.exports = router;
