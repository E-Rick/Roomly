/* eslint-disable consistent-return */
const express = require('express'),
  router = express.Router(),
  Room = require('../models/room'),
  Comment = require('../models/comment'),
  middleWare = require('../middleware'),
  Review = require('../models/review');

// INDEX - Show all rooms
router.get('/', (req, res) => {
  Room.find({}, (err, allRooms) => {
    if (err) throw err;
    res.render('rooms/index', { rooms: allRooms, page: 'rooms' });
  });
});

// CREATE - Add new room to database
router.post('/', middleWare.isLoggedIn, async (req, res) => {
  // directly attach author to existing req.body.room obj (retrieved from post form data after body-parser processes)
  req.body.room.author = {
    id: req.user._id,
    username: req.user.username
  };
  const room = await Room.create(req.body.room);
  req.flash('success', 'Successfully created listing!');
  res.redirect(`/rooms/${room._id}`);
});

// NEW - Show form to create new room
router.get('/new', middleWare.isLoggedIn, (req, res) => {
  res.render('rooms/new', { page: 'new' });
});

// SHOW - Show more  info about one room
// ID route needs to go after /new if not it will call id route
router.get('/:id', (req, res) => {
  Room.findById(req.params.id)
    .populate('comments')
    .populate({
      path: 'reviews',
      options: { sort: { createdAt: -1 } }
    })
    .exec((err, foundRoom) => {
      if (err || !foundRoom) {
        req.flash('error', 'Room not found show');
        return res.redirect('back');
      }
      // render show template with that room
      return res.render('rooms/show', { room: foundRoom });
    });
});

// EDIT - Show form to edit room
router.get('/:id/edit', middleWare.checkRoomOwnership, (req, res) => {
  res.render('rooms/edit', { room: req.room });
});

// UPDATE - Update route to update room
router.put('/:id', middleWare.checkRoomOwnership, async (req, res) => {
  // security measure to protect against rating maniputlation
  delete req.body.room.rating;
  await Room.findByIdAndUpdate(req.params.id, req.body.room);
  res.redirect(`/rooms/${req.params.id}`); // redirect (show page)
});

// DESTROY - Delete Room route
// deletes all reviews & comments associated with the room
router.delete('/:id', middleWare.checkRoomOwnership, async (req, res) => {
  await Comment.deleteMany({ _id: { $in: req.room.comments } });
  await Review.deleteMany({ _id: { $in: req.room.reviews } });
  req.room.remove(); // delete the room
  req.flash('success', `Listing "${req.room.name}" deleted successfully!`);
  res.redirect('/rooms');
});

module.exports = router;
