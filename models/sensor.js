var mongoose = require('mongoose');

var sensorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String
  },
  type: {
    type: String,
    default: 'General',
    enum: 'General Potentiometer Temperature LDR Pressure'.split(' ')
  },
  pin: {
    type: String,
    default: "A0"
  },
  unit: {
    type: String,
    default: '',
    trim: true
  },
  range: {
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 1023
    }
  }
});

module.exports = mongoose.model('Sensor', sensorSchema);
