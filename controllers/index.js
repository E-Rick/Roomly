/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
/* eslint-disable key-spacing */
const passport = require('passport'),
	util = require('util'),
	crypto = require('crypto'),
	sgMail = require('@sendgrid/mail'),
	User = require('../models/user'),
	Room = require('../models/room'),
	{ cloudinary } = require('../cloudinary'),
	{ deleteProfileImage } = require('../middleware');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = {
	async getExplore(req, res, next) {
		const rooms = await Room.paginate(
			{},
			{
				page  : req.query.page || 1,
				limit : 8
			}
		);
		rooms.page = Number(rooms.page);
		res.render('explore', { rooms, page: 'explore' });
	},

	async postRegister(req, res, next) {
		try {
			if (req.file) {
				// eslint-disable-next-line camelcase
				const { secure_url, public_id } = req.file;
				req.body.avatar = {
					secure_url,
					public_id
				};
			}
			const user = await User.register(new User(req.body), req.body.password);
			req.login(user, err => {
				if (err) return res.render('register', { error: err.message });
				passport.authenticate('local');
				req.flash('success', `Successfully signed Up ${user.username}!`);
				return res.redirect('/rooms');
			});
		} catch (err) {
			deleteProfileImage(req);
			const { username, email } = req.body;
			let error = err.message;
			if (error.includes('duplicate') && error.includes('index: email_1 dup key')) {
				error = 'A user with the given email is already registered';
			}
			res.render('register', { title: 'Register', username, email, error });
		}
	},

	getLogin(req, res, next) {
		if (req.isAuthenticated()) {
			return res.redirect('/');
		}
		if (req.query.returnTo) req.session.redirectTo = req.headers.referer;
		return res.render('login', { page: 'login' });
	},

	postLogin(req, res, next) {
		const redirectUrl = req.session.redirectTo || '/rooms';
		delete req.session.redirectTo;
		passport.authenticate('local', {
			successRedirect : redirectUrl,
			failureRedirect : '/login',
			failureFlash    : true,
			successFlash    : 'Welcome back to Roomly!'
		})(req, res, next);
	},

	getLogout(req, res, next) {
		req.logout();
		req.flash('success', 'Successfully logged you out.');
		res.redirect('/rooms');
	},

	async getProfile(req, res, next) {
		res.render('profile', { user: req.user });
	},

	async updateProfile(req, res, next) {
		try {
			// destructure username and email from req.body
			const { username, email, firstName, lastName } = req.body,
				// destructure user object from res.locals
				{ user } = res.locals;
			// check if username or email need to be updated
			if (username) user.username = username;
			if (email) user.email = email;
			if (firstName) user.firstName = firstName;
			if (lastName) user.lastName = lastName;
			if (req.file) {
				if (user.avatar.public_id) await cloudinary.v2.uploader.destroy(user.avatar.public_id);
				const { secure_url, public_id } = req.file;
				user.avatar = { secure_url, public_id };
			}
			// save the updated user to the database
			await user.save();
			// promsify req.login
			const login = util.promisify(req.login.bind(req));
			// log the user back in with new info
			await login(user);
			// redirect to /profile with a success flash message
			req.flash('success', 'Profile successfully updated!');
			res.redirect('/profile');
		} catch (err) {
			deleteProfileImage(req);
			const { username, email } = req.body;
			let error = err.message;
			if (error.includes('duplicate') && error.includes('index: email_1 dup key')) {
				error = 'A user with the given email is already registered';
			}
			res.render('profile', { title: 'Edit Profile', username, email, error });
		}
	},

	getForgotPw(req, res, next) {
		res.render('users/forgot');
	},

	async putForgotPw(req, res, next) {
		const token = await crypto.randomBytes(20).toString('hex'),
			user = await User.findOne({ email: req.body.email });
		if (!user) {
			req.flash('error', 'No account with that email address exists.');
			return res.redirect('/forgot-password');
		}

		user.resetPasswordToken = token;
		user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

		await user.save();

		const msg = {
			to      : user.email,
			from    : 'Roomly Admin <admin@roomly.com>',
			subject : 'Roomly - Forgot Password / Reset',
			text    : `You are receiving this because you (or someone else) have requested the reset of the password for your account.
			Please click on the following link, or copy and paste it into your browser to complete the process:
			http://${req.headers.host}/reset/${token}
			If you did not request this, please ignore this email and your password will remain unchanged.`.replace(/			/g, '')
		};

		await sgMail.send(msg);
		req.flash('success', `An e-mail has been sent to ${user.email} with further instructions.`);
		return res.redirect('/forgot-password');
	},
	async getReset(req, res, next) {
		const { token } = req.params,
			user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
		if (!user) {
			req.flash('error', 'Password reset token is invalid or has expired.');
			return res.redirect('/forgot-password');
		}
		return res.render('users/reset', { token });
	},
	async putReset(req, res, next) {
		const { token } = req.params,
			user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
		if (!user) {
			req.flash('error', 'Password reset token is invalid or has expired.');
			return res.redirect(`/reset/${token}`);
		}
		if (req.body.password === req.body.confirm) {
			await user.setPassword(req.body.password);
			user.resetPasswordToken = undefined;
			user.resetPasswordExpires = undefined;
			await user.save();
			const login = util.promisify(req.login.bind(req));
			await login(user);
		} else {
			req.flash('error', 'Passwords do not match.');
			return res.redirect(`/reset/${token}`);
		}
		const msg = {
			to      : user.email,
			from    : 'Roomly Admin <your@email.com>',
			subject : 'Roomly - Password Changed',
			text    : `Hello,
	  	This email is to confirm that the password for your account has just been changed.
	  	If you did not make this change, please hit reply and notify us at once.`.replace(/	  	/g, '')
		};
		await sgMail.send(msg);
		req.flash('success', 'Password successfully updated!');
		return res.redirect('/');
	},

	async getUser(req, res, next) {
		const user = await User.findById(req.params.id),
			rooms = await Room.find().where('author.id').equals(user._id).limit(4).exec();
		res.render('users/show', { user, rooms });
	}
};
