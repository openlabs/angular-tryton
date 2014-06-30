/**
@fileOverview

@toc

*/

'use strict';

angular.module('openlabs.angular-tryton', ['ngCookies'])
.config(['$httpProvider', function($httpProvider) {
  // Intercept all responses and check if the response received has an error
  // property which tryton uses to send errors the server handled.
  var trytonResponseInterceptor = ['$q', '$rootScope', function($q, $rootScope) {
    function success(response) {
      if (response.data && response.data.__error__) {
        // Handle the cases where the response is an error.
        // The __error__ attribute is set by the response Transformer
        var error = angular.copy(response.data);
        if (error[0] == 'NotLogged') {
          $rootScope.$broadcast('tryton:NotLogged');
        } else if (error[0] == 'UserError') {
          $rootScope.$broadcast('tryton:UserError', error[1], error[2]);
        } else if (error[0] == 'UserWarning') {
          $rootScope.$broadcast('tryton:UserWarning', error[1], error[2], error[3]);
        } else if (error[0] == 'ConcurrencyException') {
          $rootScope.$broadcast('tryton:ConcurrencyException', error[1]);
        } else {
          // An exception that was not one of the above types. Usually an
          // error model and a stack trace are returned. the returned error
          // array is passed as such to the broadcast.
          $rootScope.$broadcast('tryton:Exception', error);
        }
        // Finally reject the promise with the response itself
        return $q.reject(response);
      } else {
        return response || $q.when(response);
      }
    }
    function error(response) {
      // TODO: Handle all cases of HTTP error here.
      // and create the necessary signals
      return $q.reject(response);
    }
    return function(promise) {
      return promise.then(success, error);
    };
  }];
  $httpProvider.responseInterceptors.push(trytonResponseInterceptor);

  // Transform the return value by sending the result instead of the ID and
  // result object
  var trytonResponseTransformer = function(response, headerGetter) {
    if (response.hasOwnProperty('result')) {
      return response.result;
    } else if (response.hasOwnProperty('error')) {
      var error = response.error;
      error['__error__'] = true;
      return error;
    }
    return response;
  };
  $httpProvider.defaults.transformResponse.push(trytonResponseTransformer);
}])
.service('tryton', ['$http', function ($http) {
  var tryton = this;

  this.serverUrl = '/';

  // Change this URL using setServerUrl
  this.setServerUrl = function(url) {
    console.log('WARN: Method tryton.setServerUrl() will be depreciated in next version.');
    tryton.serverUrl = url;
  };


  // The lowest level RPC calling methanism which calls the given
  // database url over http with the method and parameters.
  this.rpc = function(method, params, database) {
    var request = $http.post(
      tryton.serverUrl + (database || ''),
      {
        'method': method,
        'params': params || []
      }
    );
    return request;
  };

  // Get the server's version by calling rpc method
  this.getServerVersion = function() {
    return tryton.rpc('common.version', [null, null]);
  };

}])
.service('session', ['tryton', '$cookieStore', function(tryton, $cookieStore) {
  // Controller for managing tryton session

  var session = this;

  // The Integer ID of the currently logged in User
  this.userId = null;

  // The Session ID of the current session (issued by tryton server)
  this.sessionId = null;

  // The database to which this session connects to
  this.database = null;

  // The login/username used to connect to tryton. This has to be remembered
  // for just asking for the password when a session times out.
  this.login = null;

  // The context object of the session. This is the default context from the
  // preferences of the logged in user.
  var context = null;

  var loadAllFromCookies = function() {
    // Load the values of the variables from the cookiestore.
    session.userId = $cookieStore.get('userId');
    session.sessionId = $cookieStore.get('sessionId');
    session.database = $cookieStore.get('database');
    session.login = $cookieStore.get('login');
    context = $cookieStore.get('context');
  };

  // Since the service is a singleton, on the first run just load whatever
  // is already in the session.
  loadAllFromCookies();

  var clearSession = function() {
    // Clear the session for a brand new connection
    session.userId = null;
    session.sessionId = null;
    context = null;

    // Now remove the values from the cookie store
    $cookieStore.remove('userId');
    $cookieStore.remove('sessionId');
    $cookieStore.remove('context');
  };

  this.setSession = function(_database, _login, _userId, _sessionId) {
    // Set the user and session ID and also save them to cookie store for
    // retreival. Set null if value is undefined; happens when user attempts to
    // log in to incompatible database.
    $cookieStore.put('database', _database || null);
    $cookieStore.put('login', _login || null);
    $cookieStore.put('userId', _userId || null);
    $cookieStore.put('sessionId', _sessionId || null);

    // Now that everything is stored to cookies, reuse the loadAllFromCookies
    // method to load values into variables here.
    loadAllFromCookies();
  };

  this.rpc = function(_method, _params, _context) {
    // Make a remote procedure call to tryton with the current user ID
    // session and the database in the session

    // Construct parameters: [userId, sessionId, param1, param2,... context]
    var params = [session.userId, session.sessionId].concat((_params || []));

    var requestContext = angular.copy((context || {}));
    if (_context !== undefined) {
      angular.extend(requestContext, _context);
    }
    params.push(requestContext);

    return tryton.rpc(_method, params, session.database);
  };

  this.doLogout = function() {
    var promise = session.rpc('common.db.logout');
    // Clean logout of the user
    clearSession();
    return promise;
  };

  this.setDefaultContext = function (_context) {
    $cookieStore.put('context', _context || null);
    loadAllFromCookies();
  };

  this.doLogin = function(_database, _username, _password) {
    // call login on tryton server and if the login is succesful set the
    // userId and session
    var promise = tryton.rpc(
      'common.login', [_username, _password], _database
    ).success(function(result) {
      // Since trytond returns an Array with userId and sessionId on successful
      // login and an error Object on error; false if bad credentials.
      if (result instanceof Array) {
        session.setSession(_database, _username, result[0], result[1]);
      }
    });
    return promise;
  };

  this.isLoggedIn = function () {
    return !!session.sessionId;
  }

}])
.filter('urlTryton', function ($window, tryton, session) {
  return function (name, id, type_) {
    type_ = type_ || 'model';
    if (!name) {
      return;
    }
    var values = [];
    var serverUrl = tryton.serverUrl;
    if (/^[\w]+:\/\//.test(serverUrl)) {
      // Check if url has protocol attached
      serverUrl = serverUrl.substring(serverUrl.indexOf(':'));
    }
    else {
      // Set server url as current host
      serverUrl = '://' + window.location.host + serverUrl;
    }
    values.push(serverUrl + session.database);
    values.push(type_);
    values.push(name);
    if (id) {
      values.push(id);
    }
    return 'tryton' + values.join('/');
  };
});
