'use strict';

angular.module('craneduinoControllers')

.controller('SeriesCtrl',
['$scope', '$resource', '$routeParams', 'valdr', '$modal', '$location',
function($scope, $resource, $routeParams, valdr, $modal, $location) {

  var Series = $resource('/series/:seriesId/:relation', { seriesId: '@id', relation: '@rel', command: '@cmd' }, {
    'list':     { method: 'GET', isArray: true },
    'get':      { method: 'GET', isArray: false },
    'create':   { method: 'POST' },
    'save':     { method: 'PUT' },
    'delete':   { method: 'DELETE' }
  });

  var Sensor = $resource('/sensors/:sensorId', { sensorId: '@id' }, {
    'list':     { method: 'GET', isArray: true },
    'get':      { method: 'GET', isArray: false },
    'create':   { method: 'POST' },
    'save':     { method: 'PUT' },
    'delete':   { method: 'DELETE' }
  });

  $scope.getConstraints = valdr.getConstraints;

  if ($routeParams.create) {
    $scope.createMode = true;
    $scope.series = {
      name: '',
      description: '',
      duration: '300',
      frequency: '2000',
      priority: '0'
    };
  }

  $scope.delete = function remove() {
    $scope.deleting = true;

    var modalInstance = $modal.open({
      templateUrl: 'deleteConfirm.html',
      controller:  'DeleteConfirmCtrl',
      size: 'md',
      resolve: {
        series: function() {
          return $scope.series;
        }
      }
    });

    modalInstance.result.then(function() {
      $scope.series.$delete({ seriesId: $scope.series._id }, function() {
        $scope.deleting = false;
        $location.path('/series');
      });
    }, function() {
      $scope.deleting = false;
    });
  };

  $scope.create = function create(form) {
    Series.create($scope.series, function(res) {
      $location.url('/series/' + res._id);
      $location.path('/series/' + res._id);
    })
  }

  $scope.update = function update(form) {
    if (form.$invaild)
      return;

    if ($scope.createMode) {
      $scope.create(form);
      return;
    }

    $scope.saving = true;
    $scope.series.$save({ seriesId: $scope.series._id },
      function() {
        $scope.saving = false;
    });
  };

  $scope.addSensor = function addSensor(sensor) {
    Series.create({ seriesId: $scope.series._id, relation: 'sensors' }, { _id: sensor._id }, function(res) {
      $scope.series.sensors.push(sensor);
      $scope.sensorListDiff.splice($scope.sensorListDiff.indexOf(sensor), 1);
      $scope.newSensor = $scope.sensorListDiff[0] || {};
    })
  };

  $scope.deleteSensor = function deleteSensor(sensor) {
    Series.delete({ seriesId: $scope.series._id, relation: 'sensors' }, { _id: sensor._id }, function(res) {
      $scope.sensorListDiff.push(sensor);
      $scope.series.sensors.splice($scope.series.sensors.indexOf(sensor), 1);
      $scope.newSensor = $scope.sensorListDiff[0] || {};
    })
  };

  $scope.deleteReadings = function deleteReadings() {
    Series.delete({ seriesId: $scope.series._id, relation: 'readings' }, function() {
      $scope.getValues();
    });
  };

  $scope.refreshReadings = function refreshReadings() {
    $scope.series.readings = Series.list({ seriesId: $scope.series._id, relation: 'readings' }, function() {
      if ($scope.series.readings.length <= 0)
        return;

      $scope.displaySensors = [];
      for (var i = 0; i < $scope.series.readings[0].sensors.length; i++) {
        $scope.displaySensors.push(_.find($scope.series.sensors, function(sensor) {
          return sensor._id == $scope.series.readings[0].sensors[i]._sensor;
        }));
      }

      $scope.chart = {
        title: $scope.series.name,
        subtitle: $scope.series.description,
        xAxis: 'Time [sec.]',
        yAxis: '',
        series: []
      };

      for (var i = 0; i < $scope.series.readings.length; i++) {
        $scope.series.readings[i].dt = ($scope.series.readings[i].time - new Date($scope.series.starttime).getTime()) / 1000;
      }

      for (var s = 0; s < $scope.displaySensors.length; s++) {
        var plottingSeries = [];

        for (var i = 0; i < $scope.series.readings.length; i++) {
          plottingSeries.push([$scope.series.readings[i].time, $scope.series.readings[i].sensors[s].value]);
        }

        $scope.chart.series.push({
          name: $scope.displaySensors[s].name + ' [' + $scope.displaySensors[s].unit + ']',
          data: plottingSeries
        });
      }

      $scope.createChart();

    });
  };

  $scope.startSeries = function startSeries() {
    $scope.series.readings = Series.get({ seriesId: $scope.series._id, relation: 'start' }, function() {
      $scope.getValues();
    });
  };

  $scope.stopSeries = function stopSeries() {
    $scope.series.readings = Series.get({ seriesId: $scope.series._id, relation: 'stop' }, function() {
      $scope.getValues();
    });
  };

  $scope.getValues = function getValues() {
    $scope.seriesList = Series.list({}, function() {
      var seriesId =  $routeParams.seriesId || $scope.seriesList[0]._id;
      if ($scope.createMode) {
        return;
      }

      $scope.series = Series.get({ seriesId: seriesId }, function() {
        if ('InProgress Finished'.split(' ').indexOf($scope.series.status) >= 0) {
          $scope.readMode = true;
        } else {
          $scope.readMode = false;
        }

        $scope.series.sensors = Series.list({ seriesId: seriesId, relation: 'sensors' }, function() {
          $scope.sensorList = Sensor.list({}, function() {

            var diff = _.difference(_.pluck($scope.sensorList, "_id"), _.pluck($scope.series.sensors, "_id"));
            $scope.sensorListDiff = _.filter($scope.sensorList, function(obj) {
              return diff.indexOf(obj._id) >= 0;
            });

            $scope.newSensor = $scope.sensorListDiff[0] || {};
            $scope.refreshReadings();
          });
        });

      });
    });
  };

  $scope.getValues();

  $scope.createChart = function createChart() {

    $scope.lineChart = $('#splineChart').highcharts({
      chart: {
        type: 'spline'
      },
      title: {
        text: $scope.chart.title
      },
      subtitle: {
        text: $scope.chart.subtitle
      },
      xAxis: {
        type: 'datetime',
        title: $scope.chart.xAxis
      },
      yAxis: {
        title: {
          text: $scope.chart.yAxis
        }
      },
      plotOptions: {
        spline: {
          marker: {
            enabled: $scope.series.readings.length < 40
          }
        }
      },
      series: $scope.chart.series
    });
  };

  $scope.onTabSelect = function onTabSelect(tab) {
    switch(tab) {
      case 'charts':
          $scope.showChart = true;
          $scope.createChart();
      break;
    }
  };

  // Set options for sensor type
  var sensorTypes = 'General Temperature LDR Pressure Volume Distance Voltage Pulse Shock Humidity SeismicActivity AirFlow WaterLevel UltrasonicSensor Gyroscope'.split(' ');

  var sensorTypeDisplayNames = 'Allgemein,Temperatur,LDR,Druck,Volumen,Distanz,Spannung,Puls,Erschütterung,Feuchtigkeit,Seismische Activität, Luftzug,Wasserstand,Ultraschallsensor,Gyroskop'.split(',');

  $scope.sensorTypes = {};
  for (var i = 0; i < sensorTypes.length; i++) {
    $scope.sensorTypes[sensorTypes[i]] = sensorTypeDisplayNames[i];
  }

  $scope.getDisplayName = function getDisplayName(attr, sensor){
    if (!sensor)
      return '';

    if (attr == 'type')
      return $scope.sensorTypes[sensor.type];
    else
      return sensor[attr];
  }

  $scope.getSensor = function getSensor(id) {
    for (var i = 0; i < $scope.sensorList.length; i++) {
      if ($scope.sensorList[i]._id == id) {
        $scope.newSensor = $scope.sensorList[i];
        return;
      }
    }
  };

  $scope.plotOptions = {
    series: {
      lines: { show: true },
      points: { show: true }
    }
  };



}])

.controller('DeleteConfirmCtrl', ['$scope', '$modalInstance', 'series', function($scope, $modalInstance, series) {
  $scope.series = series;

  $scope.confirm = function() {
    $modalInstance.close();
  };

  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };
}])
