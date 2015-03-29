var express = require('express');
var mongoose = require('mongoose');
var Series = require('../models/series');
var Reading = require('../models/reading');
var router = express.Router();

/* GET series listing. */
router.get('/', function(req, res, next) {
  Series.find({  }, function(err, series) {
    if (err) {
      return next(err);
    }

    res.send(series);
  });
});

/* POST series. */
router.post('/', function(req, res, next) {
  delete req.body.status;

  var series = new Series(req.body);

  series.save(function(err, obj) {
    if (err) {
      return next(err);
    }

    res.send(obj);
  });
});

/* GET series. */
router.get('/:id', function(req, res, next) {
  Series.findOne({ _id: req.params.id }, function(err, series) {
    if (err) {
      return next(err);
    }

    res.send(series);
  });
});

/* DELETE series. */
router.delete('/:id', function(req, res, next) {
  Series.remove({ _id: req.params.id }, function(err) {
    if (err) {
      return next(err);
    }

    res.sendStatus(200);
  });
});

/* UPDATE series. */
router.put('/:id', function(req, res, next) {
  delete req.body.status;
  delete req.body._id;

  Series.findOne({ _id: req.params.id }, function(err, series) {
    if (err) {
      return next(err);
    }

    for (var attr in req.body) {
      if (req.body.hasOwnProperty(attr)) {
        series[attr] = req.body[attr];
      }
    }

    series.save(function(err, series) {
      if (err) {
        return next(err);
      }

      res.send(series);
    });
  });
});

/* GET list of relation sensor. */
router.get('/:id/sensors', function(req, res, next) {
  Series.findOne({ _id: req.params.id }).populate('sensors').exec(function(err, series) {
    if (err) {
      return next(err);
    }

    res.send(series.sensors);
  });
});

/* POST relation sensor. */
router.post('/:id/sensors', function(req, res, next) {
  Series.findOne({ _id: req.params.id }, function(err, series) {
    if (err) {
      return next(err);
    }

    series.sensors.push(req.body._id);

    series.save(function(err, series) {
      if (err) {
        return next(err);
      }

      res.send(series);
    });
  });
});

/* GET list of relation reading. */
router.get('/:id/readings', function(req, res, next) {
  Reading.find({ _series: req.params.id }, function(err, readings) {
    if (err) {
      return next(err);
    }

    res.send(readings);
  });
});

/* DELETE list of relation reading. */
router.delete('/:id/readings', function(req, res, next) {
  Reading.remove({ _series: req.params.id }, function(err) {
    if (err) {
      return next(err);
    }

    res.sendStatus(200);
  });
});

module.exports = router;
