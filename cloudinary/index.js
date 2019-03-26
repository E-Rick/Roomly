const crypto = require('crypto'),
  cloudinary = require('cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});
const cloudinaryStorage = require('multer-storage-cloudinary'),
  storage = cloudinaryStorage({
    cloudinary,
    folder: 'roomly',
    allowedFormats: ['jpeg', 'jpg', 'png'],
    filename(req, file, cb) {
      let buf = crypto.randomBytes(16);
      buf = buf.toString('hex');
      let uniqFileName = file.originalname.replace(/\.jpeg|\.jpg|\.png/, '');
      uniqFileName += buf;
      cb(undefined, uniqFileName);
    }
  });

module.exports = {
  cloudinary,
  storage
};
