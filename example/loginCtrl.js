/**
*/

'use strict';

angular.module('myApp').controller('LoginCtrl', [
  '$scope', 
  'tryton', 
  'session', 
  '$sessionStorage',
  '$rootScope',
  function($scope, tryton, session, $sessionStorage, $rootScope) {
    $scope.serverInfo = {
      language: $sessionStorage.language,
      database: session.database,
      sessionId: session.sessionId,
    };

    // An array to store all events
    $scope.events = [];

    function logEvent(name, event, args) {
      $scope.events.unshift({
        name: name,
        event: event,
        args: args
      })
    };
    $rootScope.$on('tryton:NotLogged', function(event, args) {
      logEvent('NotLogged', event, args);
      // Also clear the sessionID in local scope so that the login
      // window is shown
      $scope.serverInfo.sessionId = null;
    });
    $rootScope.$on('tryton:UserError', function(event, args) {
      logEvent('UserError', event, args);
    });
    $rootScope.$on('tryton:UserWarning', function(event, args) {
      logEvent('UserWarning', event, args);
    });
    $rootScope.$on('tryton:ConcurrencyException', function(event, args) {
      logEvent('ConcurrencyException', event, args);
    });
    $rootScope.$on('tryton:Exception', function(event, args) {
      logEvent('Exception', event, args);
    });    


    tryton.getServerVersion().success(function(response){
      $scope.version = response;
    });
    tryton.rpc('common.list_lang', [null, null]).success(function(response){
      $scope.languages = response;
    });
    tryton.rpc('common.list', [null, null]).success(function(response){
      $scope.databases = response;
    });
    $scope.doLogin = function() {
      $sessionStorage.language = $scope.serverInfo.language;
      session.doLogin($scope.serverInfo.database, $scope.login.username, $scope.login.password)
        .success(function(data){
          $scope.serverInfo.sessionId = data[1];
        })
    };
    $scope.logout = function() {
      session.doLogout();
      $scope.serverInfo.sessionId = null;
    };
}]);
