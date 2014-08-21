var should = require("chai").should();

var Server = require('../../server/server');
var server = new Server( );

describe("server", function () {

	before(function(done){
		server.init();
		server.serve( done );
	});

	describe("testTokenRetrieve", function () {
		it('should save without error', function(done){
			done();
		});
	});

	after(function(done){
		server.close( done );
	});

});
