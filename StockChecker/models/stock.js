const mongoose = require('mongoose');

const stockSchema = mongoose.Schema({
  stockTicker: String,
  likes: Number
});

module.exports = mongoose.model('Stock', stockSchema);
