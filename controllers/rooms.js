/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-unused-vars */
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding'),
	mapBoxToken = process.env.MAPBOX_TOKEN,
	geocodingClient = mbxGeocoding({ accessToken: mapBoxToken }),
	Room = require('../models/room'),
	Review = require('../models/review'),
	{ cloudinary } = require('../cloudinary');

module.exports = {
	async roomIndex(req, res, next) {
		const { dbQuery } = res.locals;
		delete res.locals.dbQuery;
		const rooms = await Room.paginate(dbQuery, {
			page  : req.query.page || 1,
			limit : 16
		});
		rooms.page = Number(rooms.page);
		if (!rooms.docs.length && res.locals.query) {
			res.locals.error = 'No results match that query.';
		}
		res.render('rooms/index', { rooms, page: 'rooms', mapBoxToken });
	},

	async roomCreate(req, res, next) {
		// directly attach author to existing req.body.room obj (retrieved from room form data after body-parser processes)
		req.body.room.author = {
			id       : req.user._id,
			username : req.user.username
		};
		req.body.room.images = [];
		for (const file of req.files) {
			req.body.room.images.push({
				url       : file.secure_url,
				public_id : file.public_id
			});
		}
		const response = await geocodingClient
			.forwardGeocode({
				query : req.body.room.location,
				limit : 1
			})
			.send();
		req.body.room.geometry = response.body.features[0].geometry;
		const room = await Room.create(req.body.room);
		req.flash('success', 'Successfully created listing!');
		res.redirect(`/rooms/${room._id}`);
	},

	roomNew(req, res, next) {
		res.render('rooms/new', { page: 'new' });
	},

	async roomShow(req, res, next) {
		try {
			const room = await Room.findById(req.params.id)
				.populate({
					path    : 'reviews',
					options : { sort: { createdAt: -1 } }
				})
				.populate('author.id')
				.exec();
			// Check if valid room id length links to a room
			// eslint-disable-next-line no-throw-literal
			if (!room) throw 'Error';
			const reviews = await Room.findById(req.params.id).populate('author.id').exec();
			res.render('rooms/show', { room, mapBoxToken });
		} catch (err) {
			req.flash('error', 'Sorry, No room listing with that ID not found.');
			res.redirect('/explore');
		}
	},

	roomEdit(req, res, next) {
		res.render('rooms/edit', { room: req.room });
	},

	async roomUpdate(req, res, next) {
		// security measure to protect against rating maniputlation
		delete req.body.room.rating;
		const room = await Room.findById(req.params.id);
		//  check if there's any images for deletion
		if (req.body.deleteImages && req.body.deleteImages.length) {
			//  loop over deleteImages
			for (const public_id of req.body.deleteImages) {
				//  delete images from cloudinary
				await cloudinary.v2.uploader.destroy(public_id);
				//  delete image from room.images
				for (const image of room.images) {
					if (image.public_id === public_id) {
						const index = room.images.indexOf(image);
						room.images.splice(index, 1);
					}
				}
			}
		}
		//  check if there are any new images for upload
		if (req.files) {
			//  upload images
			for (const file of req.files) {
				//  add images to room.images array
				room.images.push({
					url       : file.secure_url,
					public_id : file.public_id
				});
			}
		}
		// check if location was updated
		if (req.body.room.location !== room.location) {
			const response = await geocodingClient
				.forwardGeocode({
					query : req.body.room.location,
					limit : 1
				})
				.send();
			room.geometry = response.body.features[0].geometry;
			room.location = req.body.room.location;
		}
		// update the room with any new properties
		room.name = req.body.room.name;
		room.description = req.body.room.description;
		room.price = req.body.room.price;
		//  save the updated room into the db
		await room.save();
		res.redirect(`/rooms/${req.params.id}`); // redirect (show page)
	},

	async roomDestroy(req, res, next) {
		for (const image of req.room.images) {
			await cloudinary.v2.uploader.destroy(image.public_id);
		}
		await Review.deleteMany({ _id: { $in: req.room.reviews } });
		req.room.remove(); // delete the room
		req.flash('success', `Listing "${req.room.name}" deleted successfully!`);
		res.redirect('/explore');
	}
};
