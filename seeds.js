/* eslint-disable max-len */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-unused-vars */
require('mongoose');
const Room = require('./models/room'),
  Review = require('./models/review');

const seeds = [
  {
    name: 'Private Poolhouse with Amazing View',
    image:
      'https://images.unsplash.com/photo-1430285561322-7808604715df?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1950&q=80',
    price: '35',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum',
    author: {
      id: '588c2e092403d111454fff76',
      username: 'Jack'
    }
  },
  {
    name: 'Spacious Loft Close to Everything',
    image:
      'https://images.unsplash.com/photo-1494526585095-c41746248156?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1950&q=80',
    price: '90',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum',
    author: {
      id: '588c2e092403d111454fff71',
      username: 'Jill'
    }
  },
  {
    name: 'Luxurious Cabin House',
    image:
      'https://images.unsplash.com/photo-1550355191-aa8a80b41353?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=934&q=80',
    price: '140',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum',
    author: {
      id: '588c2e092403d111454fff77',
      username: 'Jane'
    }
  }
];

function calculateAverage(reviews) {
  if (reviews.length === 0) {
    return 0;
  }
  let sum = 0;
  reviews.forEach(element => {
    sum += element.rating;
  });
  return sum / reviews.length;
}

async function seedDB() {
  await Room.deleteMany({});
  await Review.deleteMany({});
  for (const seed of seeds) {
    const room = await Room.create(seed);
    // eslint-disable-next-line one-var
    const review = await Review.create({
      rating: 5,
      text: 'This place is great, but I wish there was internet',
      room: room._id,
      author: {
        id: '588c2e092403d111454fff76',
        username: 'Jack'
      }
    });
    room.reviews.push(review);
    room.rating = calculateAverage(room.reviews);
    room.save();
  }
}

module.exports = seedDB;
