/* eslint-disable prefer-const */
/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
const express = require('express'),
  Room = require('../models/room.js'),
  Comment = require('../models/comment.js'),
  middleware = require('../middleware'),
  router = express.Router({ mergeParams: true });

// Comments - New
router.get('/new', middleware.isLoggedIn, (req, res) => {
  // find room by id
  Room.findById(req.params.id, (err, room) => {
    if (err || !room) {
      req.flash('error', 'No room found here');
      res.redirect('back');
    } else {
      res.render('comments/new', { room });
    }
  });
});

// Comments - Create
router.post('/', middleware.isLoggedIn, async (req, res) => {
  // lookup room using ID
  let room = await Room.findById(req.params.id);
  if (!room) {
    req.flash('error', 'Something went wrong');
    res.redirect('/rooms');
  }
  let comment = await Comment.create(req.body.comment);
  // add username and id to comment
  comment.author.id = req.user._id;
  comment.author.username = req.user.username;
  // save comment
  comment.save();
  room.comments.push(comment);
  room.save();
  req.flash('success', 'Successfully added comment');
  res.redirect(`/rooms/${room._id}`);
});

// Comments - Edit
router.get('/:comment_id/edit', middleware.checkCommentOwnership, (req, res) => {
  Room.findById(req.params.id, (err, foundRoom) => {
    if (err || !foundRoom) {
      req.flash('error', 'No room found');
      return res.redirect('back');
    }
    Comment.findById(req.params.comment_id, (error, foundComment) => {
      if (error || !foundComment) {
        req.flash('error', 'Comment not found');
        res.redirect('/rooms');
      } else {
        res.render('comments/edit', { room_id: req.params.id, comment: foundComment });
      }
    });
  });
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
