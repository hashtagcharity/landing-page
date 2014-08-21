var cluster = require('cluster');
var http = require('http');
var numCPUs = require('os').cpus().length;

var Server = require('./server');
var server = new Server( );

if (cluster.isMaster) {
	for (var i = 0; i < numCPUs; i += 1) {
		cluster.fork();
	}

	cluster.on('exit', function(worker, code, signal) {
		console.log('Worker ' + worker.process.pid + ' died');
	});
} else {
	server.init();
	server.serve();
}
