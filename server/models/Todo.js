
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Todo = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: true,
    index: true,
  },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  done: { type: Boolean, default: false },

  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },

  completedAt: { type: Date, default: null },
}, {
  timestamps: true,
});

module.exports = mongoose.model('todos', Todo);
