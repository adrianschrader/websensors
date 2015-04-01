var os = require('os-utils');
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

    res.send({
      linux: {
        type: os.type(),
        platform: os.platform(),
        arch: os.arch()
      },
      server: {
        uptime:  {
          system: os.uptime(),
          process: os.processUptime()
        },
        loadavg: os.loadavg()
      },
      memory: {
        total: os.totalmem(),
        free:  os.freemem(),
      },
      cpu: {
        count: os.countCPUs()
      }
    });
  });
});

module.exports = router;
