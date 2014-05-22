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
    
    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });
  });

  // Test the session functionality
  describe('session', function() {
    var $httpBackend, tryton, session, $cookieStore;

    beforeEach(inject(function(_$httpBackend_, _$cookieStore_, _tryton_, _session_) {
      $httpBackend = _$httpBackend_;
      $cookieStore = _$cookieStore_;
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
      expect($cookieStore.get('sessionId')).toBe('session');
      expect($cookieStore.get('userId')).toBe(1);
      expect($cookieStore.get('database')).toBe('database');
      expect($cookieStore.get('login')).toBe('admin');

      spyOn(session, 'doLogout').andCallThrough();
      session.doLogout();

      expect($cookieStore.get('sessionId')).toBeUndefined();
      expect($cookieStore.get('userId')).toBeUndefined();

      $httpBackend.flush(); // flush requests
    });

    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });


  });
});
