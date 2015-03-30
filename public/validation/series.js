angular.module('craneduino')

.config(['valdrProvider', function(valdrProvider) {
  valdrProvider.addConstraints({
    'Series': {
      'name': {
        'size': {
          'min': 3,
          'max': 20,
          'message': 'Der Name der Messreihe muss zwischen 3 und 20 Zeichen lang sein.'
        },
        'required': {
          'message': 'Der Name der Messreihe ist ein Pflichtfeld. '
        }
      },
      'duration': {
        'min': {
          'value': 10,
          'message': 'Die Messreihe muss mindestens 10 sec lang laufen.'
        },
        'max': {
          'value': 86400,
          'message': 'Die Messreihe darf höchstens 24h (86400sec) unbeaufsichtig laufen.'
        },
        'required': {
          'message': 'Die Dauer der Messreihe ist ein Pflichtfeld.'
        }
      },
      'frequency': {
        'min': {
          'value': 200,
          'message': 'Messwerte können schnellstens alle 200ms erfasst werden.'
        },
        'max': {
          'value': 1800,
          'message': 'Es muss mindestens alle 30min (1800sec) ein Messwert erfasst werden.'
        },
        'required': {
          'message': 'Die Frequenz der Messreihe ist ein Pflichtfeld.'
        }
      }
    }
  });
}]);
