var http = require('http');
var fs = require('fs');
var mkdirp = require('mkdirp');

var server = http.createServer(function(req, resp){

	var outputDir = 'dist/coverage/web' + req.url;

	mkdirp(outputDir, function (err) {
		if (err) {
			console.error(err);
		}
		else {
			req.pipe(fs.createWriteStream(outputDir + '/coverage.json'));
		}
		resp.end();
	});

})

var port = 7358;
server.listen(port);
console.log('Listening on', port);
