var mongoose = require('mongoose');

var readingSchema = new mongoose.Schema({
  time: {
    type: Date,
    default: new Date(),
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  _sensor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sensor',
    required: true
  },
  _series: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Series',
    required: true
  }
});

module.exports = mongoose.model('Reading', readingSchema);
