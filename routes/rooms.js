/* eslint-disable consistent-return */
const express = require('express'),
  router = express.Router(),
  Room = require('../models/room'),
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
router.post('/', middleWare.isLoggedIn, (req, res) => {
  // get data from form and add to rooms array
  // directly attach author to existing req.body.room obj (retrieved from post form data after body-parser processes)
  req.body.room.author = {
    id: req.user._id,
    username: req.user.username
  };
  // create new room and save to DB
  Room.create(req.body.room, (err, newRoom) => {
    if (err) req.flash('error', 'Error occurred making listing');
    else {
      // redirect back to room page
      req.flash('success', 'Successfully created listing!');
      res.redirect(`/rooms/${newRoom._id}`);
    }
  });
});

// NEW - Show form to create new room
router.get('/new', middleWare.isLoggedIn, (req, res) => {
  res.render('rooms/new');
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
        req.flash('error', 'Room not found');
        return res.redirect('back');
      }
      // render show template with that room
      return res.render('rooms/show', { room: foundRoom });
    });
});

// EDIT - Show form to edit room
router.get('/:id/edit', middleWare.checkRoomOwnership, (req, res) => {
  Room.findById(req.params.id, (err, foundRoom) => {
    res.render('rooms/edit', { room: foundRoom });
  });
});

// UPDATE - Update route to update room
router.put('/:id', middleWare.checkRoomOwnership, (req, res) => {
  // security measure to protect against rating maniputlation
  delete req.body.room.rating;
  Room.findByIdAndUpdate(req.params.id, req.body.room, err => {
    if (err) res.redirect('/rooms');
    res.redirect(`/rooms/${req.params.id}`); // redirect (show page)
  });
});

// DESTROY - Delete Room route
router.delete('/:id', middleWare.checkRoomOwnership, (req, res) => {
  Room.findById(req.params.id, (err, room) => {
    if (err) return res.redirect('/rooms');
    // deletes all reviews associated with the room
    Review.deleteMany({ _id: { $in: room.reviews } }, error => {
      if (error) {
        return res.redirect('/rooms');
      }
      room.remove(); // delete the room
      req.flash('success', `Listing "${room.name}" deleted successfully!`);
      return res.redirect('/rooms');
    });
  });
});

module.exports = router;
