'use strict';

angular.module('craneduinoControllers')

.controller('SensorsCtrl',
['$scope', '$resource', '$routeParams', 'valdr', '$modal', '$location',
function($scope, $resource, $routeParams, valdr, $modal, $location) {

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
    $scope.sensor = {
      name: '',
      description: '',
      type: 'General',
      unit: 'mV',
      range: {
        min: 0,
        max: 5000
      }
    };
  }


  $scope.delete = function remove() {
    $scope.deleting = true;

    var modalInstance = $modal.open({
      templateUrl: 'deleteConfirm.html',
      controller:  'DeleteConfirmCtrl',
      size: 'md',
      resolve: {
        sensor: function() {
          return $scope.sensor;
        }
      }
    });

    modalInstance.result.then(function() {
      $scope.sensor.$delete({ sensorId: $scope.sensor._id }, function() {
        $scope.deleting = false;
        $location.path('/sensors');
      });
    }, function() {
      $scope.deleting = false;
    });
  };

  $scope.create = function create() {
    Sensor.create($scope.sensor, function(res) {
      $location.url('/sensors/' + res._id);
      $location.path('/sensors/' + res._id);
    })
  }

  $scope.update = function update() {
    if ($scope.sensorForm.$invaild)
      return;

    if ($scope.pinUndefined) {
      $scope.sensor.pin = 'None';
    }

    if ($scope.createMode) {
      $scope.create();
      return;
    }


    $scope.saving = true;
    console.log($scope.sensorForm);

    $scope.sensor.$save({ sensorId: $scope.sensor._id },
      function() {
        $scope.saving = false;
    });
  };

  $scope.sensorList = Sensor.list({}, function() {
    var sensorId =  $routeParams.sensorId || $scope.sensorList[0]._id;
    if ($scope.createMode) {
        manipulateSensor();
        return;
    }
    $scope.sensor = Sensor.get({ sensorId: sensorId }, function() {
      manipulateSensor();
      $scope.disabled[$scope.sensor.pin] = false;
      if ($scope.sensor.pin == 'None') {
        $scope.pinUndefined = true;
      }
    });
  });

  var manipulateSensor = function manipulateSensor() {
    // Determine unusable analogPins
    $scope.disabled = {};
    var freePins = [ 'A0', 'A1', 'A2', 'A3', 'A4', 'A5' ];
    for (var i = $scope.sensorList.length - 1; i > -1; i--) {
      console.log($scope.disabled);
      $scope.disabled[$scope.sensorList[i].pin] = true;
      freePins.splice(freePins.indexOf($scope.sensorList[i].pin),1);
    }

    if ($scope.createMode) {
      $scope.sensor.pin = freePins[0];
    }
  }

  // Set options for sensor type
  var sensorTypes = 'General Temperature LDR Pressure Volume Distance Voltage Pulse Shock Humidity SeismicActivity AirFlow WaterLevel UltrasonicSensor Gyroscope'.split(' ');

  var sensorTypeDisplayNames = 'Allgemein,Temperatur,LDR,Druck,Volumen,Distanz,Spannung,Puls,Erschütterung,Feuchtigkeit,Seismische Activität, Luftzug,Wasserstand,Ultraschallsensor,Gyroskop'.split(',');

  $scope.sensorTypes = [];
  for (var i = 0; i < sensorTypes.length; i++) {
    $scope.sensorTypes.push({
      name: sensorTypes[i],
      displayName: sensorTypeDisplayNames[i]
    });
  }


}])

.controller('DeleteConfirmCtrl', ['$scope', '$modalInstance', 'sensor', function($scope, $modalInstance, sensor) {
  $scope.sensor = sensor;

  $scope.confirm = function() {
    $modalInstance.close();
  };

  $scope.cancel = function() {
    $modalInstance.dismiss('cancel');
  };
}])
