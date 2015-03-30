angular.module('craneduino')

.config(['valdrProvider', function(valdrProvider) {
  valdrProvider.addConstraints({
    'Sensor': {
      'name': {
        'size': {
          'min': 3,
          'max': 20,
          'message': 'Der Name des Sensors muss zwischen 3 und 20 Zeichen lang sein.'
        },
        'required': {
          'message': 'Der Name des Sensors ist ein Pflichtfeld. '
        }
      },
      'type': {
        'required':  {
          'message': 'Der Typ des Sensors ist ein Pflichtfeld. '
        }
      },
      'pin': {
        'required': {
          'message': 'Es muss ein Pin für den Sensor festgelegt werden.'
        }
      },
      'unit': {
        'size': {
          'max': 6,
          'message': 'Einheitenbezeichnungen dürfen max. 6 Zeichen lang sein. '
        }
      },
      'range.min': {
        'required':  {
          'message': 'Die untere Grenze des Wertebereichs muss definiert sein. '
        }
      },
      'range.max': {
        'required':  {
          'message': 'Die obere Grenze des Wertebereichs muss definiert sein.  '
        }
      }
    }
  });
}]);
