function buildUpAA( config, authom, rest ){
	authom.createServer({
		service: "linkedin",
		id: config.linkedin.apiKey,
		secret: config.linkedin.secretKey,
		scopes: config.linkedin.scopes,
		fields: config.linkedin.fields
	});

	authom.on("auth", function(req, res, data) {
		console.log('User auth succeeded. DATA: ' + data );
	});

	authom.on("error", function(req, res, data) {
		console.error('User auth failed. STATUS: ' + res.statusCode + " " + 'HEADERS: ' + JSON.stringify(res.headers) );
	});
}

exports.buildUpAA = buildUpAA;
