var express = require('express');
var mongoose = require('mongoose');
var Reading = require('../models/reading');
var router = express.Router();

/* GET reading listing. */
router.get('/', function(req, res, next) {
  Reading.find({  }, function(err, reading) {
    if (err) {
      return next(err);
    }

    res.send(reading);
  });
});

/* POST reading. */
router.post('/', function(req, res, next) {
  var reading = new Reading(req.body);

  reading.time = +new Date();

  reading.save(function(err, obj) {
    if (err) {
      return next(err);
    }

    res.send(obj);
  });
});

/* GET reading. */
router.get('/:id', function(req, res, next) {
  Reading.findOne({ _id: req.params.id }, function(err, reading) {
    if (err) {
      return next(err);
    }

    res.send(reading);
  });
});

/* DELETE series. */
router.delete('/:id', function(req, res, next) {
  Reading.remove({ _id: req.params.id }, function(err) {
    if (err) {
      return next(err);
    }

    res.sendStatus(200);
  });
});

/* UPDATE series. */
/* Readings can't be updated
router.put('/:id', function(req, res, next) {
  delete req.body._id;

  Reading.findOne({ _id: req.params.id }, function(err, reading) {
    if (err) {
      return next(err);
    }

    for (var attr in req.body) {
      if (req.body.hasOwnProperty(attr)) {
        reading[attr] = req.body[attr];
      }
    }

    reading.save(function(err, reading) {
      if (err) {
        return next(err);
      }

      res.send(reading);
    });
  });
});
*/

module.exports = router;
