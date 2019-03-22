/* eslint-disable no-unused-vars */
const Room = require('../models/room'),
  Comment = require('../models/comment'),
  Review = require('../models/review');

module.exports = {
  async roomIndex(req, res, next) {
    const rooms = await Room.find({});
    res.render('rooms/index', { rooms, page: 'rooms' });
  },

  async roomCreate(req, res, next) {
    // directly attach author to existing req.body.room obj (retrieved from post form data after body-parser processes)
    req.body.room.author = {
      id: req.user._id,
      username: req.user.username
    };
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
        .populate('comments')
        .populate({
          path: 'reviews',
          options: { sort: { createdAt: -1 } }
        })
        .exec();
      // Check if valid room id length links to a room
      // eslint-disable-next-line no-throw-literal
      if (!room) throw 'Error';
      res.render('rooms/show', { room });
    } catch (err) {
      req.flash('error', 'Sorry, No room listing with that ID not found.');
      res.redirect('/rooms');
    }
  },

  roomEdit(req, res, next) {
    res.render('rooms/edit', { room: req.room });
  },

  async roomDestroy(req, res, next) {
    await Comment.deleteMany({ _id: { $in: req.room.comments } });
    await Review.deleteMany({ _id: { $in: req.room.reviews } });
    req.room.remove(); // delete the room
    req.flash('success', `Listing "${req.room.name}" deleted successfully!`);
    res.redirect('/rooms');
  }
};
