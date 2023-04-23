const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Comment = new Schema(
  {
    author: { type: String, maxLength: 255 },
    comment: { type: String, maxLength: 600 },
  },
  { collection: 'comments', timestamps: true },
);

module.exports = mongoose.model('Comment', Comment);
