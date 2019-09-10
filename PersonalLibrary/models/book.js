const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({
  title: { type: String, required: true, immutable: true },
  comments: [String]
});

module.exports = mongoose.model('Book', bookSchema);
