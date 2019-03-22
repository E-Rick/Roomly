/* eslint-disable consistent-return */
const express = require('express'),
  router = express.Router(),
  { roomIndex, roomCreate, roomNew, roomShow, roomEdit, roomUpdate, roomDestroy } = require('../controllers/rooms'),
  { isLoggedIn, asyncErrorHandler, checkRoomOwnership } = require('../middleware');

// INDEX - Show all rooms
router.get('/', asyncErrorHandler(roomIndex));

// CREATE - Add new room to database
router.post('/', isLoggedIn, asyncErrorHandler(roomCreate));

// NEW - Show form to create new room
router.get('/new', isLoggedIn, roomNew);

// SHOW - Show more  info about one room
// ID route needs to go after /new if not it will call id route
router.get('/:id', asyncErrorHandler(roomShow));

// EDIT - Show form to edit room
router.get('/:id/edit', checkRoomOwnership, roomEdit);

// UPDATE - Update route to update room
router.put('/:id', checkRoomOwnership, asyncErrorHandler(roomUpdate));

// DESTROY - Delete Room route
// deletes all reviews & comments associated with the room
router.delete('/:id', checkRoomOwnership, asyncErrorHandler(roomDestroy));

module.exports = router;
