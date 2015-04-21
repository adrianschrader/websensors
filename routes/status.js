var utils       = require('os-utils'),
    os          = require('os'),
    express     = require('express'),
    config      = require('config'),
    mongoose    = require('mongoose'),
    Sensor      = require('../models/sensor'),
    router      = express.Router();

/* GET sensor listing. */
router.get('/', function(req, res, next) {
  Sensor.find({  }, function(err, sensor) {
    if (err) {
      return next(err);
    }

    res.send({
      name: config.get('server'),
      linux: {
        type: os.type(),
        arch: os.arch(),
        platform: utils.platform()
      },
      server: {
        uptime:  {
          system: os.uptime(),
          process: utils.processUptime()
        },
        loadavg: utils.loadavg()
      },
      memory: {
        total: os.totalmem(),
        free:  os.freemem(),
      }
    });
  });
});

module.exports = router;
