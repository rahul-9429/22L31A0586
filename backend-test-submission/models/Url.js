const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
  shortcode: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  originalUrl: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    required: true
  },
  clickCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

urlSchema.index({ shortcode: 1 });
urlSchema.index({ expiryDate: 1 });
urlSchema.index({ isActive: 1 });

module.exports = mongoose.model('Url', urlSchema);