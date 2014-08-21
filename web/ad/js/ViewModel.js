var ko = require('knockout');
var Interface = require('../../abstract/js/Interface');
var knockout_mapper = require('knockout.mapper.js');
var user = require('../../../models/User');

var theRealModel = ko.observable();

var firstMapping = true;
var theViewModel = {};

var thePrototype;

function buildUpModel( data, self ) {
	var S = data.statics;
	var M = data.dataModel;
	var V = data.validation;
	var F = data.methods;

	thePrototype = M;

	ko.mapObject( self, M, V, F, S );

	theRealModel( self );

	if( firstMapping ){
		ko.applyBindings( theRealModel );

		firstMapping = false;
	}
}

module.exports = {
	init: function(callback) {
		buildUpModel( user, theViewModel );
		callback( null, theViewModel );
	},
	viewModel: function() {
		return theRealModel();
	},
	viewModelAsJSON: function(_model, _prototype) {
		return ko.toJSONByPrototype( _model || theRealModel(), _prototype || thePrototype);
	},
	prototype: function(){
		return thePrototype;
	}
};
