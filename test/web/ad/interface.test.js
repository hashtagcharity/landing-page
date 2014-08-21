var i = require("../../../web/abstract/js/Interface.js"),
	should = require("chai").should();

describe("b", function () {
	it("should have a foo property", function () {
		i.should.have.a.property("apiVersion");
	});

	describe(".apiVersion", function() {
		it("should be equal '1.0.0'", function () {
			i.apiVersion.should.equal("1.0.0");
		});
	});

});
