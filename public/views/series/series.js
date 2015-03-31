'use strict';

angular.module('craneduinoControllers')

.controller('SeriesCtrl',
['$scope', '$resource', '$routeParams', 'valdr', '$modal', '$location',
function($scope, $resource, $routeParams, valdr, $modal, $location) {

  var Series = $resource('/series/:seriesId/:command', { seriesId: '@id', command: '@cmd' }, {
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
    Series.create({ seriesId: $scope.series._id, command: 'sensors' }, { _id: sensor._id }, function(res) {
      $scope.series.sensors.push(sensor);
      $scope.sensorListDiff.splice($scope.sensorListDiff.indexOf(sensor), 1);
      $scope.newSensor = {};
    })
  };

  $scope.deleteSensor = function deleteSensor(sensor) {
    Series.delete({ seriesId: $scope.series._id, command: 'sensors' }, { _id: sensor._id }, function(res) {
      $scope.sensorListDiff.push(sensor);
      $scope.series.sensors.splice($scope.series.sensors.indexOf(sensor), 1);
      $scope.newSensor = {};
    })
  };

  $scope.seriesList = Series.list({}, function() {
    var seriesId =  $routeParams.seriesId || $scope.seriesList[0]._id;
    if ($scope.createMode) {
        manipulateSeries();
        return;
    }
    $scope.series = Series.get({ seriesId: seriesId }, function() {
      if ($scope.createMode)
        return;

      $scope.series.sensors = Series.list({ seriesId: seriesId, command: 'sensors' }, function() {
        $scope.sensorList = Sensor.list({}, function() {


          var diff = _.difference(_.pluck($scope.sensorList, "_id"), _.pluck($scope.series.sensors, "_id"));
          $scope.sensorListDiff = _.filter($scope.sensorList, function(obj) {
            return diff.indexOf(obj._id) >= 0;
          });

          //$scope.newSensor = $scope.sensorListDiff[0] || {};
          $scope.newSensor = {};
        });
      });

    });
  });




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
  }

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
