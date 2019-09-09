const mongoose = require('mongoose');

const issueSchema = mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    issue_title: { type: String, required: true },
    issue_text: { type: String, required: true },
    created_by: { type: String, required: true },
    assigned_to: String,
    status_text: String,
    open: { type: Boolean, default: true },
    project: { type: String, required: true }
  },
  { timestamps: { createdAt: 'created_on', updatedAt: 'updated_on' } }
);

module.exports = mongoose.model('Issue', issueSchema);
