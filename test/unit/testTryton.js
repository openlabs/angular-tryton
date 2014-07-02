/**
 *
 * Test the tryton angular js module
 *
 */

'use strict';

describe('angular-tryton', function() {
  
  // Mock the angular-tryton module
  beforeEach(angular.mock.module('openlabs.angular-tryton'));

  // Test the core rpc functionality
  describe('core-rpc', function() {
    var $httpBackend, tryton;

    beforeEach(inject(function(_$httpBackend_, _tryton_) {
      $httpBackend = _$httpBackend_;
      tryton = _tryton_;
    }));
    
    it('makes a simple rpc', function() {
      $httpBackend.expectPOST('/', {"method":"hello.world","params":[]})
        .respond(200, {id: 0, result: "Hello World"});
      tryton.rpc('hello.world');

      $httpBackend.flush(); // flush requests
    });

    it('get the server version', function() {
      $httpBackend.expectPOST(
        '/', {"method":"common.version","params":[null,null]}
        ).respond(200, {id: 0, result: "2.3.2"});

      // create a spy for the function to ensure its called
      spyOn(tryton, 'getServerVersion').andCallThrough();
      spyOn(tryton, 'rpc').andCallThrough();

      tryton.getServerVersion().success(function(version) {
        expect(version).toBe('2.3.2');
      });

      $httpBackend.flush(); // flush requests
    });

    it('should not mess with non-tryton responses like views', function() {
      var rv = 'just another string response';
      $httpBackend.expectPOST(
        '/', {'method':'nothing', params:[]}
        ).respond(200, rv);
      tryton.rpc('nothing', []).success(function(result){
        expect(result).toEqual(rv);
      });

      $httpBackend.flush(); // flush requests
    });

    it('server errors should not become results', function() {
      $httpBackend.expectPOST(
        '/', {'method':'nothing', params:[]}
        ).respond(500, '');
      tryton.rpc('nothing', []).success(function(result){
        expect(result).toEqual('this should never be true');
      });
      
      $httpBackend.flush(); // flush requests
    });

    it('should reject promises when server responds with error', function() {
      $httpBackend.expectPOST(
        '/', {method: 'notlogged', params: []}
        ).respond(200, {id: 0, error: ['NotLogged']});

      tryton.rpc('notlogged', [])
      .error(function(data) {
        expect(data[0]).toBe('NotLogged');
      });

      $httpBackend.flush(); // flush requests
    });

    it('should be possible to change the server base url', function() {
      $httpBackend.expectPOST(
        'http://erp.openlabs.us/',
        {"method":"hello.world","params":[]})
        .respond(200, {id: 0, result: "Hello World"});

      tryton.setServerUrl('http://erp.openlabs.us/');
      tryton.rpc('hello.world');

      $httpBackend.flush(); // flush requests
    });
    
    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });
  });

  // Test the events broadcasted when tryton sends an error
  describe('events', function() {
    var $httpBackend, tryton, scope;
    var eventCallbacks = {
      'NotLogged': function() {},
      'UserError': function() {},
      'UserWarning': function() {},
      'ConcurrencyException': function() {},
      'Exception': function() {}
    };
    beforeEach(inject(function(_$httpBackend_, _$rootScope_, _tryton_) {
      $httpBackend = _$httpBackend_;
      tryton = _tryton_;
      scope = _$rootScope_;
    }));

    it('should broadcast NotLogged when not logged', function() {
      $httpBackend.expectPOST(
        '/', {method: 'notlogged', params: []}
        ).respond(200, {id: 0, error: ['NotLogged']});

      spyOn(eventCallbacks, 'NotLogged');
      scope.$on('tryton:NotLogged', eventCallbacks.NotLogged);

      tryton.rpc('notlogged', []).then(function() {
        expect(eventCallbacks.NotLogged).toHaveBeenCalled();
      });

      $httpBackend.flush(); // flush requests
    });

    it('should broadcast UserError when it happens', function() {
      $httpBackend.expectPOST(
        '/', {method: 'usererror', params: []}
        ).respond(200, {id: 0, error: ['UserError', 'message', 'description']});

      spyOn(eventCallbacks, 'UserError');
      scope.$on('tryton:UserError', eventCallbacks.UserError);

      tryton.rpc('usererror', []).then(function() {
        expect(eventCallbacks.UserError).toHaveBeenCalled();
      });

      $httpBackend.flush(); // flush requests
    });

    it('should broadcast UserWarning when it happens', function() {
      $httpBackend.expectPOST(
        '/', {method: 'userwarning', params: []}
        ).respond(200, {id: 0, error: ['UserWarning', 'name', 'messsage', 'description']});

      spyOn(eventCallbacks, 'UserWarning');
      scope.$on('tryton:UserWarning', eventCallbacks.UserWarning);

      tryton.rpc('userwarning', []).then(function() {
        expect(eventCallbacks.UserWarning).toHaveBeenCalled();
      });

      $httpBackend.flush(); // flush requests
    });

    it('should broadcast ConcurrencyException when it happens', function() {
      $httpBackend.expectPOST(
        '/', {method: 'concurrencyexception', params: []}
        ).respond(200, {id: 0, error: ['ConcurrencyException', 'message']});

      spyOn(eventCallbacks, 'ConcurrencyException');
      scope.$on('tryton:ConcurrencyException', eventCallbacks.ConcurrencyException);

      tryton.rpc('concurrencyexception', []).then(function() {
        expect(eventCallbacks.ConcurrencyException).toHaveBeenCalled();
      });

      $httpBackend.flush(); // flush requests
    });

    it('should broadcast Exception when it happens', function() {
      $httpBackend.expectPOST(
        '/', {method: 'exception', params: []}
        ).respond(200, {id: 0, error: ['', 'message']});

      spyOn(eventCallbacks, 'Exception');
      scope.$on('tryton:Exception', eventCallbacks.Exception);

      tryton.rpc('exception', [])
        .then(function() {
          expect(eventCallbacks.Exception).toHaveBeenCalled();
        });

      $httpBackend.flush(); // flush requests
    });

    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });
  });

  // Test the session functionality
  describe('session', function() {
    var $httpBackend, tryton, session, $localStorage, $sessionStorage;

    beforeEach(inject(function(_$httpBackend_, _$localStorage_, _$sessionStorage_, _tryton_, _session_) {
      $httpBackend = _$httpBackend_;
      $localStorage = _$localStorage_;
      $sessionStorage = _$sessionStorage_;
      tryton = _tryton_;
      session = _session_;
    }));

    it('should login and store session and userid', function() {
      $httpBackend.expectPOST(
        '/database', {"method":"common.login","params":['admin','admin']}
        ).respond(200, {id: 0, result: [1, 'session']});
      // Expect a second request with the id and session
      $httpBackend.expectPOST(
        '/database', {"method":"test","params":[1, 'session', 'hello', {}]}
        ).respond(200, {id: 0, result: 'world'});

      spyOn(session, 'doLogin').andCallThrough();

      session.doLogin('database', 'admin', 'admin').success(function(result) {
        expect(result).toEqual([1, 'session']);
        expect(session.isLoggedIn()).toBe(true);
        session.rpc('test', ['hello']);
      });
      $httpBackend.flush(); // flush requests
    });

    it('should update the context if provided to request', function() {
      $httpBackend.expectPOST(
        '/',
        {"method":"test-context","params":[null, null, 'hello', {'company': 1}]}
        ).respond(200, {id: 0, result: ''});
      
      spyOn(session, 'rpc').andCallThrough();

      session.rpc('test-context', ['hello'], {'company': 1})
      
      $httpBackend.flush(); // flush requests
    });

    it('logout should clear sessionId and UserID', function() {
      $httpBackend.expectPOST(
        '/database', {"method":"common.db.logout","params":[1, 'session', {}]}
        ).respond(200, {id: 0, result: 'ok'});

      session.setSession('database', 'admin', 1, 'session');
      expect($sessionStorage.sessionId).toBe('session');
      expect($localStorage.userId).toBe(1);
      expect($localStorage.database).toBe('database');
      expect($localStorage.login).toBe('admin');

      spyOn(session, 'doLogout').andCallThrough();
      session.doLogout();

      expect($localStorage.sessionId).toBeUndefined();
      expect($localStorage.userId).toBeUndefined();

      $httpBackend.flush(); // flush requests
    });

    it('set default session in context', function() {
      session.setDefaultContext({'user': 1});
      expect(angular.toJson($sessionStorage.context)).toBe(angular.toJson({'user': 1}));
    });

    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

  });

  describe('Filter: urlTryton', function () {

    var $httpBackend, tryton, session, $localStorage, urlTryton;

    beforeEach(inject(function(_$httpBackend_, _$localStorage_, $filter, _tryton_, _session_) {
      $httpBackend = _$httpBackend_;
      $localStorage = _$localStorage_;
      tryton = _tryton_;
      session = _session_;
      urlTryton = $filter('urlTryton');
    }));

    it('should map url from localhost', function () {
      session.setSession('database', 'admin', 1, 'session');
      expect(urlTryton('party.party')).toMatch(/^tryton:\/\/localhost:\d+\/database\/model\/party\.party$/);
      expect(urlTryton('party.party', 2)).toMatch(/^tryton:\/\/localhost:\d+\/database\/model\/party\.party\/2$/);
      expect(urlTryton('party.party', 2, 'wizard')).toMatch(/^tryton:\/\/localhost:\d+\/database\/wizard\/party\.party\/2$/);
    });

    it('should map url from remote', function () {
      tryton.setServerUrl('http://tryton.openlabs.us/');
      session.setSession('database', 'admin', 1, 'session');
      expect(urlTryton('party.party')).toMatch(/^tryton:\/\/tryton\.openlabs\.us\/database\/model\/party\.party$/);
    });

    it('should not return url', function () {
      session.setSession('database', 'admin', 1, 'session');
      expect(function () {
        urlTryton();
      }).toThrow(new Error("Name in urlTryton filter is required."));
    });

  });
});
