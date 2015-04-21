var mongoose  = require('mongoose'),
    Status    = require('../models/status.js'),
    utils     = require('os-utils'),
    config    = require('config');

module.exports = function () {
  if (config.get('monitoring.enabled')) {
    clearStatus(function() {
      saveStatus();
      console.log('Started monitoring...');
    });
  }
};

var clearStatus = function clearStatus(callback) {
  Status.remove({}, function(err) {
    if (err)
      console.log(err);
    callback();
  })
};

var saveStatus = function saveStatus() {
  var status = new Status({
    time: Date.now(),
    loadavg: utils.loadavg(),
    memory: utils.freememPercentage()
  });

  status.save(function(err, status) {
    if (err) {
      console.log(err);
    }

    console.log(status);


    setTimeout(saveStatus, config.get('monitoring.frequency'));
  })
}
