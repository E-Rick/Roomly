const router = require('express').Router(),
	multer = require('multer'),
	{ asyncErrorHandler, isLoggedIn, isValidPassword, changePassword } = require('../middleware'),
	{
		getExplore,
		postRegister,
		postLogin,
		getLogin,
		getLogout,
		getProfile,
		getUser,
		updateProfile,
		getForgotPw,
		putForgotPw,
		getReset,
		putReset
	} = require('../controllers'),
	{ storage } = require('../cloudinary'),
	upload = multer({ storage });

// Root route
router.get('/', (req, res) => {
	res.render('landing');
});

router.get('/explore', getExplore);

// show register form
router.get('/register', (req, res) => {
	res.render('register', { page: 'register' });
});

// Handle signup logic route
router.post('/register', upload.single('avatar'), asyncErrorHandler(postRegister));

// show login form
router.get('/login', getLogin);

// handling login logic route
router.post('/login', postLogin);

// logout route
router.get('/logout', getLogout);

// User profiles
router.get('/profile', isLoggedIn, asyncErrorHandler(getProfile));

router.put(
	'/profile',
	upload.single('avatar'),
	isLoggedIn,
	asyncErrorHandler(isValidPassword),
	asyncErrorHandler(changePassword),
	asyncErrorHandler(updateProfile)
);

router.get('/users/:id', asyncErrorHandler(getUser));

/* GET /forgot */
router.get('/forgot-password', getForgotPw);

/* PUT /forgot */
router.put('/forgot-password', asyncErrorHandler(putForgotPw));

/* GET /reset/:token */
router.get('/reset/:token', asyncErrorHandler(getReset));

/* PUT /reset/:token */
router.put('/reset/:token', asyncErrorHandler(putReset));

module.exports = router;
