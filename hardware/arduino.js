var mongoose  = require('mongoose'),
    express   = require('express'),
    five      = require('johnny-five'),
    _         = require('underscore'),
    Reading = require('../models/reading'),
    Series = require('../models/series'),
    router = express.Router();

var board, series, sensors, occupied = false, connected = false;

board = five.Board();

board.on('ready', function() {
  connected = true;
});

var endMessurement = function endMessurement() {
  Series.findOne({ _id: series._id }, function(err, series){
    if (err)
      console.log(err);

    series.status = 'Finished';
    series.endtime = Date.now();

    series.save(function(err, series) {
      if (err)
        console.log(err);

        occupied = false;
        series = null;
      });
    });
};

var initialize = function initialize() {
  var values = [];

  for (var i = 0; i < series.sensors.length; i++) {
    var sensor = series.sensors[i];

    if (sensor.pin == 'None')
      break;



    var new_sensor = new five.Sensor({
      pin: sensor.pin,
      freq: series.frequency
    });

    new_sensor.model = sensor;

    new_sensor.scale([ sensor.range.min, sensor.range.max ])
    .on('data', function() {

      if ((Date.now() - new Date(series.starttime)) > series.duration * 1000 && occupied) {
        endMessurement();
        return;
      } else if(!occupied) {
        return;
      }

      values.push({ value: this.value, _sensor: this.model._id });

      if (values.length == series.sensors.length) {
        var reading = new Reading({ sensors: values, _series: series._id, time: (Date.now()) });
        reading.save(function(err, reading) {
          if (err)
            console.log(err);

          values = [];

          console.log('Beep!', reading);
        });
      }
    });
  }

  board.repl.inject({
    sensors: sensors
  });
};

/* GET (stop series). */
router.get('/series/:id/stop', function(req, res, next) {
  if (series)
    endMessurement();
  res.sendStatus(200);
});

/* GET (start series). */
router.get('/series/:id/start', function(req, res, next) {
  Series.findOne({ _id: req.params.id }).populate('sensors').exec(function(err, obj) {
    if (err) {
      return next(err);
    }

    if (occupied)
      return next(new Error("Arduino already occupied with another series. "));

    if (!connected)
      return next(new Error("There is no Arduino connection. "));

    // Set properties in series
    obj.status = 'InProgress';
    obj.starttime = Date.now();
    obj.save();

    // Set global board variables
    series = _.clone(obj);
    occupied = true;

    Reading.remove({ _series: series._id }, function(err) {
      if (err) {
        return next(err);
      }

      initialize();

      res.sendStatus(200);
    });
  });
});

module.exports = router;
