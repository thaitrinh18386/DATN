const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');

const User = new Schema(
  {
    username: { type: String, maxLength: 20, require: true },
    password: {
      type: String,
      maxLength: 60,
      required: [true, 'Bạn cần điền mật khẩu'],
      minlength: [6, 'nhập nhiều hơn 6 ký tự'],
    },
    role: { type: Number },
  },
  { collection: 'users', timestamps: true },
);

User.methods.encryptPassword = function (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
};

User.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', User);
