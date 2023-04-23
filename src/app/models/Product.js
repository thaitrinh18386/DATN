const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Product = new Schema(
  {
    name: { type: String, require: true },
    desc: { type: String, maxLength: 255 },
    color: { type: String, maxLength: 255 },
    price: { type: Number, maxLength: 255 },
    expensive: { type: Number, maxLength: 255 },
    quantity: { type: Number, maxLength: 255 },
    cost: { type: Number, maxLength: 255 },
    discount: { type: Number, maxLength: 255 },
    category: { type: String, require: true },
    images: { type: Array },
    details: { type: String, require: true, ref: 'Details' },
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }]
  },
  { collection: 'products', timestamps: true },
);

module.exports = mongoose.model('Product', Product);
