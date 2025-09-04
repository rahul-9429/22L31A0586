const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  shortcode: {
    type: String,
    required: true,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  referrer: {
    type: String,
    default: 'Direct'
  },
  userAgent: {
    type: String,
    default: 'Unknown'
  },
  ip: {
    type: String,
    default: 'Unknown'
  },
  location: {
    type: String,
    default: 'Unknown'
  }
}, {
  timestamps: true
});

analyticsSchema.index({ shortcode: 1 });
analyticsSchema.index({ timestamp: -1 });

module.exports = mongoose.model('Analytics', analyticsSchema);