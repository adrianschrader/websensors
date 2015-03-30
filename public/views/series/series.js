'use strict';

angular.module('craneduinoControllers')

.controller('SeriesCtrl',
['$scope', '$resource', '$routeParams', 'valdr', '$modal', '$location',
function($scope, $resource, $routeParams, valdr, $modal, $location) {

  var Series = $resource('/series/:seriesId', { seriesId: '@id', command: '@cmd' }, {
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

  $scope.create = function create() {
    Series.create($scope.series, function(res) {
      $location.url('/series/' + res._id);
      $location.path('/series/' + res._id);
    })
  }

  $scope.update = function update() {
    if ($scope.seriesForm.$invaild)
      return;

    if ($scope.pinUndefined) {
      $scope.series.pin = 'None';
    }

    if ($scope.createMode) {
      $scope.create();
      return;
    }


    $scope.saving = true;

    $scope.series.$save({ seriesId: $scope.series._id },
      function() {
        $scope.saving = false;
    });
  };


  $scope.seriesList = Series.list({}, function() {
    var seriesId =  $routeParams.seriesId || $scope.seriesList[0]._id;
    if ($scope.createMode) {
        manipulateSeries();
        return;
    }
    $scope.series = Series.get({ seriesId: seriesId }, function() {
      manipulateSeries();
    });
  });

  var manipulateSeries = function manipulateSeries() {
      var slider = $('#priority').slider({
        ticks: [ 0, 100, 200, 300 ],
        ticks_labels: [ 'Belanglos', 'Normal', 'Wichtig', 'Sehr Wichtig' ],
        ticks_snap_bounds: 1,
        value: 0
      });

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
