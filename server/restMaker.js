exports.buildUp = function( rest ){

	var allower = function(req, pathname, version){
		return true;
	};
	var protector = function(req, pathname, version){
		return req.session && req.session.uid;
	};

	// Salted token retrieving function. In case of encrypted cookies and JS state-changer calls from static pages
	rest.get( { path: '/token', unprotected: true, protector: allower, version: '1.0.0' }, function( request, content, callback ){
		callback( null, { token: request.csrfToken(), issueDate: Date.now() } );
	} );

	rest.post( { path: '/interest', unprotected: true, protector: allower, version: '1.0.0' }, function( request, content, callback ){
		global.connectivity.store( global.db.Mail, content, null, null, null, function(err, obj){
			if( err )
				return callback( err, 'Could not store document(s).' );
			else
				global.mailer.sendMail( 'interest', obj.address, function(err, res){
					callback( err, 'Done.' );
				} );
		} );
	});

	rest.get( { path: '/?page/?id', unprotected: true, protector: allower, context: '/pages' }, function( request, content, callback ){
		var isMobileBrowser = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test( request.headers['user-agent'] );

		var jadeGlobals = { id: request.parameters.id, isMobileBrowser: isMobileBrowser, token: request.csrfToken(), pretty: global.isDevelopment };

		global.renderer.render( request.parameters.page, jadeGlobals, callback );
	}, { contentType:'text/html' } );

};
