const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Details = new Schema(
  {
    size: { type: String, maxLength: 255 },
    weight: { type: String, maxLength: 255 },
    ratio: { type: String, maxLength: 255 },
    material: { type: String, maxLength: 255 },
    function: { type: String, maxLength: 255 },
  },
  { collection: 'details' },
);

module.exports = mongoose.model('Details', Details);
