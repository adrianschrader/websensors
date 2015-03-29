var express = require('express');
var mongoose = require('mongoose');
var Sensor = require('../models/sensor');
var router = express.Router();

/* GET sensor listing. */
router.get('/', function(req, res, next) {
  Sensor.find({  }, function(err, sensor) {
    if (err) {
      return next(err);
    }

    res.send(sensor);
  });
});

/* POST sensor. */
router.post('/', function(req, res, next) {
  var sensor = new Sensor(req.body);

  sensor.save(function(err, obj) {
    if (err) {
      return next(err);
    }

    res.send(obj);
  });
});

/* GET sensor. */
router.get('/:id', function(req, res, next) {
  Sensor.findOne({ _id: req.params.id }, function(err, sensor) {
    if (err) {
      return next(err);
    }

    res.send(sensor);
  });
});

/* DELETE series. */
router.delete('/:id', function(req, res, next) {
  Sensor.remove({ _id: req.params.id }, function(err) {
    if (err) {
      return next(err);
    }

    res.sendStatus(200);
  });
});

/* UPDATE series. */
router.put('/:id', function(req, res, next) {
  delete req.body._id;

  Sensor.findOne({ _id: req.params.id }, function(err, sensor) {
    if (err) {
      return next(err);
    }

    for (var attr in req.body) {
      if (req.body.hasOwnProperty(attr)) {
        sensor[attr] = req.body[attr];
      }
    }

    sensor.save(function(err, sensor) {
      if (err) {
        return next(err);
      }

      res.send(sensor);
    });
  });
});

module.exports = router;
