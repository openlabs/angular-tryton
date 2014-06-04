/**
@toc
1. setup - whitelist, appPath, html5Mode
*/

'use strict';

angular.module('myApp', ['ngRoute',	'openlabs.angular-tryton', 'ui.bootstrap'])
.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
	$routeProvider
    .when('/playground', {templateUrl: 'pages/playground.html'})
    .otherwise({redirectTo: '/playground'});
}]);
