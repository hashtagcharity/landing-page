var _ = require('lodash');

function genericCall( URI, HTTP_FUNC, model, headers, dataRequired, callback ){
	$.ajax({
		url: URI,
		type: HTTP_FUNC,
		dataType: 'json',
		data: model,
		headers: _.extend( headers || {}, { 'accept-version': this.apiVersion } ),
		xhrFields: {
			withCredentials: true
		}
	}).done( function( data ){
		console.log("Data Saved. Response: ", data);
		if( callback )
			callback( (dataRequired && !data) ? new Error('Missing data.' + URI) : null, data );
	}).fail( function( err ) {
		console.log('failed' + err);
		if( callback )
			callback( err, null );
	});
}

module.exports = {
	apiVersion: '1.0.0',
	del: function( URI, headers, dataRequired, callback ) {
		$.ajax({
			url: URI,
			type: 'DELETE',
			headers: _.extend( headers || {}, { 'accept-version': this.apiVersion } ),
			xhrFields: {
				withCredentials: true
			}
		}).done( function( data ){
			if( callback )
				callback( (dataRequired && !data) ? new Error('Missing data.' + URI) : null, data );
		}).fail( function( err ) {
			if( callback ) callback( err, null );
		});
	},
	send: function( URI, model, headers, dataRequired, callback ) {
		$.ajax({
			url: URI,
			type: 'POST',
			dataType: 'json',
			data: model,
			headers: _.extend( headers || {}, { 'accept-version': this.apiVersion } ),
			xhrFields: {
				withCredentials: true
			}
		}).done( function( data ){
			if( callback )
				callback( (dataRequired && !data) ? new Error('Missing data.' + URI) : null, data );
		}).fail( function( err ) {
			if( callback ) callback( err, null );
		});
	},
	retrieve: function( URI, headers, dataRequired, callback ) {
		$.ajax({
			type: "GET",
			url: URI,
			headers: _.extend( headers || {}, { 'accept-version': this.apiVersion } ),
			xhrFields: {
				withCredentials: true
			}
		})
		.done( function(data){
			callback( (dataRequired && !data) ? new Error('Missing data.' + URI) : null, data );
		} )
		.fail(function( err ) { if( callback ) callback( err, null ); });
	}
};
