var mongoose  = require('mongoose'),
    express   = require('express'),
    five      = require('johnny-five'),
    config    = require('config'),
    _         = require('underscore'),
    Reading = require('../models/reading'),
    Series = require('../models/series'),
    router = express.Router();

var board, running_series, series, values = {}, occupied = false, connected = false, lastLoop = Date.now();

if (config.get('arduino.enabled')) {
  board = new five.Board();
  board.on('ready', function() {
    connected = true;
    occupied = false;

    initialize(this, 0);
  });
}

var endMeasurement = function endMeasurement() {
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

var analogPins = 'A0 A1 A2 A3 A4 A5'.split(' ');
var initialize = function initialize(board, index) {
  if (index >= analogPins.length)
    return;

  board.analogRead(index, function(voltage) {
    values[analogPins[index]] = voltage;
  });
  initialize(board, index + 1);
};

var scaleReadings = function scaleReadings(value, min1, max1, min2, max2) {
  var m = (max2 - min2) / (max1-min1);
  return (m * value) + (min2 - (min1 * m));
}

/* GET (stop series). */
router.get('/series/:id/stop', function(req, res, next) {
  if (series)
    endMeasurement();
  res.sendStatus(200);
});

/* GET (start series). */
router.get('/series/:id/start', function(req, res, next) {
  if (!config.get('arduino.enabled'))
    return next(new Error("The arduino connection is disabled in this application. If this behaviour is not appreciated, update the config/production.json "));

  if (occupied)
    return next(new Error("Arduino already occupied with another series. "));

  if (!connected)
    return next(new Error("There is no Arduino connection. "));

  Series.findOne({ _id: req.params.id }).populate('sensors').exec(function(err, obj) {
    if (err) {
      return next(err);
    }



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

      board.loop(20, function() {
        if ((Date.now() - new Date(series.starttime)) > series.duration * 1000 && occupied) {
          endMeasurement();
          return;
        } else if(!occupied) {
          return;
        }

        if ((Date.now() - lastLoop) > series.frequency) {
          lastLoop = Date.now();

          var sensors = [];
          for (var i = 0; i < series.sensors.length; i++) {
            sensors.push({
              value: scaleReadings(values[series.sensors[i].pin], 0, 1023,
                series.sensors[i].range.min, series.sensors[i].range.max),
              _sensor: series.sensors[i]._id
            });
          }

          var reading = new Reading({ sensors: sensors, _series: series._id, time: Date.now() });
          reading.save(function(err, reading) {
            if (err) {
              console.log(err);
            }

            console.log('Beep!', reading);
          });
        }
      });

      res.sendStatus(200);
    });
  });
});

module.exports = router;
