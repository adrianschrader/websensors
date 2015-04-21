/**
 * Model Plant
 * Defines the database model for a generic plant (part of a plant tub)
 */
var mongoose = require('mongoose');

var plantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String
  },
  species: {
    type: String,
    default: 'Unknown'
    required: true
  },
  _sensor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sensor'
    required: true
  },
  sensorType: {
    type: String,
    default: 'Capacity',
    enum: 'Hygrometer Capacity Resistance',
    required: true
  },
  target: {
    type: Number,
    required: true
  },
  response: {
    type: Number,
    default: 600,
    required: true
  }
});

module.exports = mongoose.model('Plant', plantSchema);
