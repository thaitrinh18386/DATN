const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const Order = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, required: true },
    cart: { type: Object, required: true },
    address: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true }
  },
  { collection: 'orders', timestamps: true }
);

module.exports = mongoose.model('Order', Order);
