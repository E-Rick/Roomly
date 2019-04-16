const express = require('express'),
	router = express.Router(),
	multer = require('multer'),
	{ storage } = require('../cloudinary'),
	upload = multer({ storage }),
	{ roomIndex, roomCreate, roomNew, roomShow, roomEdit, roomUpdate, roomDestroy } = require('../controllers/rooms'),
	{ isLoggedIn, asyncErrorHandler, checkRoomOwnership, searchAndFilterPosts } = require('../middleware');

// GET rooms index /rooms
router.get('/', asyncErrorHandler(searchAndFilterPosts), asyncErrorHandler(roomIndex));

// POST rooms create /rooms
router.post('/', isLoggedIn, upload.array('images', 4), asyncErrorHandler(roomCreate));

// GET rooms new /rooms/new
router.get('/new', isLoggedIn, roomNew);

// GET rooms show /rooms/:id
router.get('/:id', asyncErrorHandler(roomShow));

// GET rooms edit /rooms/:id/edit
router.get('/:id/edit', checkRoomOwnership, roomEdit);

// PUT rooms update /rooms/:id
router.put('/:id', checkRoomOwnership, upload.array('images', 4), asyncErrorHandler(roomUpdate));

// DELETE rooms destroy /rooms/:id
router.delete('/:id', checkRoomOwnership, asyncErrorHandler(roomDestroy));

module.exports = router;
