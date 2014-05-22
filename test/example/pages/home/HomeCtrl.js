/**
*/

'use strict';

angular.module('myApp').controller('HomeCtrl', ['$scope', 'tryton', 'session', function($scope, tryton, session) {
  tryton.getServerVersion().success(function(response){
    $scope.version = response;
  });
  tryton.rpc('common.list_lang', [null, null]).success(function(response){
    $scope.languages = response;
  });
  tryton.rpc('common.list', [null, null]).success(function(response){
    $scope.databases = response;
  });
  $scope.login = function() {
    session.doLogin($scope.database, $scope.login.username, $scope.login.password)
      .success(function(data){
        console.log(data);
      })
  }
  $scope.fieldsViewGet = function() {
    session.rpc('model.' + $scope.model + '.fields_view_get', [88]).success(function(response){
      $scope.fvgResponse = response;
    });
  }
}]);
