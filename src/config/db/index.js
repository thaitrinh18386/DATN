const mongoose = require('mongoose');
async function connect() {
  try {
    await mongoose.connect('mongodb://localhost:27017/DATN', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connect successfully!');
  } catch (error) {
    console.log('Connect failue!');
  }
}

module.exports = { connect };
