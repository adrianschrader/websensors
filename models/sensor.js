/**
 * Model Sensor
 * Defines the database model for a sensor that listens to a specified analog pin
 */
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
    enum: 'General Temperature LDR Pressure Volume Distance Voltage Pulse Shock Humidity SeismicActivity AirFlow WaterLevel UltrasonicSensor Gyroscope'.split(' '),
    required: true
  },
  pin: {
    type: String,
    default: 'A0',
    enum: 'None A0 A1 A2 A3 A4 A5'.split(' '),
    required: true
  },
  unit: {
    type: String,
    default: '',
    trim: true
  },
  range: {
    min: {
      type: Number,
      default: 0,
      required: true
    },
    max: {
      type: Number,
      default: 1023,
      required: true
    }
  }
});

module.exports = mongoose.model('Sensor', sensorSchema);
