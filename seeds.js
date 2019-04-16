/* eslint-disable key-spacing */
/* eslint-disable max-len */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
require('mongoose');
const faker = require('faker'),
	Room = require('./models/room'),
	cities = require('./cities'),
	Review = require('./models/review');

async function seedRooms() {
	await Room.deleteMany({});
	for (const i of new Array(600)) {
		const random1000 = Math.floor(Math.random() * 1000),
			random5 = Math.floor(Math.random() * 6),
			room = {
				name        : faker.lorem.word(),
				description : faker.lorem.text(),
				geometry    : {
					coordinates : [cities[random1000].longitude, cities[random1000].latitude],
					type        : 'Point'
				},
				author      : {
					id       : '5c9947b9a0b393ab487af779',
					username : 'poorl'
				},
				location    : `${cities[random1000].city}, ${cities[random1000].state}`,
				price       : random1000,
				rating      : random5
			};
		await Room.create(room);
	}
	console.log('600 new rooms created');
}

module.exports = seedRooms;
