/**
@toc
1. setup - whitelist, appPath, html5Mode
*/

'use strict';

angular.module('myApp', ['ngRoute',	'openlabs.angular-tryton'])
.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
	$routeProvider
    .when('/home', {templateUrl: 'pages/home/home.html'})
    .otherwise({redirectTo: '/home'});
}]);
