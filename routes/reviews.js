/* eslint-disable object-curly-newline */
/* eslint-disable consistent-return */
const express = require('express'),
	router = express.Router({ mergeParams: true }),
	{ reviewIndex, reviewCreate, reviewNew, deleteReview, reviewEdit, reviewUpdate } = require('../controllers/reviews'),
	{ asyncErrorHandler, isLoggedIn, checkReviewExistence, checkReviewOwnership, checkRoom } = require('../middleware');

// GET reviews index /rooms/:id/reviews
router.get('/', asyncErrorHandler(reviewIndex));

// GET reviews new /rooms/:id/reviews/new
router.get('/new', isLoggedIn, checkReviewExistence, checkRoom, reviewNew);

// POST reviews create /rooms/:id/reviews
router.post('/', isLoggedIn, checkReviewExistence, asyncErrorHandler(reviewCreate));

// GET reviews edit /rooms/:id/reviews/:review_id/edit
router.get('/:review_id/edit', checkRoom, checkReviewOwnership, reviewEdit);

// PUT reviews update /rooms/:id/reviews/:review_id
router.put('/:review_id', checkReviewOwnership, asyncErrorHandler(reviewUpdate));

// DELETE reviews destroy /rooms/:id/reviews/:review_id
router.delete('/:review_id', checkReviewOwnership, asyncErrorHandler(deleteReview));

module.exports = router;
