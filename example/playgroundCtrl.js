/**
*/

'use strict';

angular.module('myApp').controller('PlaygroundCtrl', [
  '$scope', 
  'tryton', 
  'session', 
  function($scope, tryton, session) {
    $scope.request = {
      type: 'model',
      model: '',
      params: '',
      context: '{}'
    };

    $scope.responses = [];
    $scope.status = {
      isFirstOpen: true
    };

    $scope.paramsHasError = false;
    $scope.paramsError = null;
    $scope.validateParams = function() {
      try {
        JSON.parse('[' + $scope.request.params + ']');
        $scope.paramsHasError = false;
        $scope.paramsError = null;
        return true;
      } catch (e) {
        $scope.paramsHasError = true;
        $scope.paramsError = e.message;
        return false;
      }
    };

    $scope.contextHasError = false;
    $scope.contextError = null;
    $scope.validateContext = function() {
      try {
        JSON.parse($scope.request.context);
        $scope.contextHasError = false;
        $scope.contextError = null;
        return true;
      } catch (e) {
        $scope.contextHasError = true;
        $scope.contextError = e.message;
        return false;
      }
    };    

    $scope.makeRequest = function() {
      var method = $scope.request.type;
      if (method != 'common') {
        method += ("." + $scope.request.model);
      }
      method +=  ("." + $scope.request.method);
      var params = [];
      if ($scope.request.params) {
        params = JSON.parse('[' + $scope.request.params + ']');
      }
      var context = JSON.parse($scope.request.context);
      session.rpc(method, params, context)
      .success(function(data) {
        $scope.responses.unshift({
          data: data,
          method: method,
          params: params,
          context: context,
          success: true
        });
      })
      .error(function(data) {
        console.log('error');
        $scope.responses.unshift({
          data: data,
          method: method,
          params: params,
          context: context,
          success: false
        });
      });
    };
}]);
