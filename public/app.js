'use strict';

// Declare app level module which depends on views, and components
angular.module('craneduino', [
'ngRoute',
'ngResource',
'ui.bootstrap',
'ui.bootstrap-slider',
'angular-flot',
'smart-table',
'valdr',
'craneduinoControllers'
])
.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/home', {
    templateUrl: 'views/home/home.html',
    controller: 'HomeCtrl'
  })
  .when('/sensors', {
    templateUrl: 'views/sensors/sensors.html',
    controller: 'SensorsCtrl'
  })
  .when('/sensors/:sensorId', {
    templateUrl: 'views/sensors/sensors.html',
    controller: 'SensorsCtrl'
  })
  .when('/series', {
    templateUrl: 'views/series/series.html',
    controller: 'SeriesCtrl'
  })
  .when('/series/:seriesId', {
    templateUrl: 'views/series/series.html',
    controller: 'SeriesCtrl'
  })
  .otherwise({ redirectTo: '/home' });
}]);
