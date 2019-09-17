const mongoose = require('mongoose');

const threadSchema = mongoose.Schema(
  {
    board: { type: String, required: true },
    text: { type: String, required: true },
    reported: { type: Boolean, default: false },
    delete_password: { type: String, required: true },
    replies: [
      {
        text: { type: String, required: true },
        delete_password: { type: String, required: true },
        reported: { type: Boolean, default: false }
      }
    ],
    repliesCount: { type: Number, default: 0 }
  },
  { timestamps: { createdAt: 'created_on', updatedAt: 'bumped_on' } }
);

module.exports = mongoose.model('Thread', threadSchema);
