/**
 * Model Status
 * Defines the database model for a status reading of essential system parameters
 * to monitor performence, memory and load.
 */
var mongoose = require('mongoose');

var statusSchema = new mongoose.Schema({
  time: {
    type: Date,
    required: true
  },
  loadavg: {
    type: Number,
    required: true,
    range: {
      min: 0,
      max: 1
    }
  },
  memory: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('Status', statusSchema);
