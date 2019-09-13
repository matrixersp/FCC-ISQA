const mongoose = require('mongoose');

const addressLogSchema = mongoose.Schema({
  ip: String,
  stockTicker: String,
  time: { type: Date, default: Date.now }
});

module.exports = mongoose.model('addressLog', addressLogSchema);
