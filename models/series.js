/**
* Model Series
* Depreciated
*/
var mongoose = require('mongoose');

var seriesSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String
  },
  status: {
    type: String,
    default: 'Queued',
    enum: 'OnHold Queued InProgress Finished Error'.split(' ')
  },
  priority: {
    type: Number,
    min: -1,
    max: 2,
    default: 0,
    required: true
  },
  frequency: {
    type: Number,
    default: 1000,
    required: true
  },
  duration: {
    type: Number,
    default: 300,
    required: true
  },
  starttime: {
    type: Date,
    default: null
  },
  endtime: {
    type: Date,
    default: null
  },
  sensors: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sensor'
    }
  ]
});

module.exports = mongoose.model('Series', seriesSchema);
