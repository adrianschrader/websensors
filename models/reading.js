/**
 * Model Reading
 * Defines the database model for multiple sensor readings at a specific time
 */
var mongoose = require('mongoose');

var readingSchema = new mongoose.Schema({
  time: {
    type: Number,
    required: true
  },
  sensors: [{
    value: {
      type: Number,
      required: true
    },
    _sensor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sensor',
      required: true
    },
  }],
  _tub: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tub',
    required: true
  }
});

module.exports = mongoose.model('Reading', readingSchema);
