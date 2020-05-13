/* eslint-disable key-spacing */
const mongoose = require('mongoose'),
	mongoosePaginate = require('mongoose-paginate'),
	User = require('./user'),
	Review = require('./review');

// SCHEMA SETUP

const roomSchema = new mongoose.Schema({
	name        : String,
	price       : Number,
	images      : [{ url: String, public_id: String }],
	description : String,
	location    : String,
	geometry    : {
		type        : {
			type     : String,
			enum     : ['Point'],
			required : true
		},
		coordinates : {
			type     : [Number],
			required : true
		}
	},
	properties  : {
		description : String
	},
	author      : {
		id       : {
			type : mongoose.Schema.Types.ObjectId,
			ref  : 'User'
		},
		username : String
	},
	reviews     : [
		{
			type : mongoose.Schema.Types.ObjectId,
			ref  : 'Review'
		}
	],
	rating      : {
		type    : Number,
		default : 0
	}
});

// Async call to remove comments/reviews if you delete the room
roomSchema.pre('remove', async () => {
	await Review.deleteMany({
		_id : {
			$in : this.reviews
		}
	});
});

roomSchema.plugin(mongoosePaginate);

roomSchema.index({ geometry: '2dsphere' });

module.exports = mongoose.model('Room', roomSchema);
