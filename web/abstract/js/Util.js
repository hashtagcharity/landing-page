var async = require('async');
var _ = require('lodash');

module.exports = {
	communicationRetry: 0,
	getURLParameters: function(paramName, defaultValue) {
		var sURL = window.document.URL.toString();
		if (sURL.indexOf("?") > 0) {
			var arrParams = sURL.split("?");
			var arrURLParams = arrParams[1].split("&");
			var i = 0;
			for (i=0; i<arrURLParams.length; i += 1) {
				var sParam =  arrURLParams[i].split("=");
				if( sParam[0] === paramName )
					return decodeURIComponent(sParam[1]);
			}
		}
		return defaultValue;
	},
	clearCookie: function( name, path ){
		$.removeCookie( name, { path: path || '/' } );
	},
	authenticated: function( name ){
		return $.cookie( name );
	},
	showAuthError: function( callback ){
		if(callback) callback();
	},
	showAuthSuccess: function( callback ){
		if(callback) callback();
	},
	showNetworkError: function( callback ){
		if(callback) callback();
	},
	showLoginModal: function( callback ){
		if(callback) callback();
	},
	showMessageModal: function( callback ){
		if(callback) callback();
	},
	communicate: function( operates, callback, guardCallback, count ){
		if( !count ) count = 0;
		var isArray = _.isArray( operates );
		var self = this;
		async.series( isArray ? operates : [operates], function(err, results){
			if( err ){
				if(guardCallback) guardCallback( false );
				if( err.getResponseHeader('REQUIRES_AUTH') && err.status === 401 )
					self.showLoginModal();
				else if( count === self.communicationRetry ){
					callback( err, null );
				} else {
					self.showNetworkError( function(){ self.communicate( operates, callback, guardCallback, count + 1 ); } );
				}
			}
			else{
				if(guardCallback) guardCallback( true );
				callback( err, isArray ? results : results.shift() );
			}
		} );
	}
};
