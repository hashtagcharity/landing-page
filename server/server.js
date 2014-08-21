var connect = require('connect'),
	compression = require('compression'),
	morgan  = require('morgan'),
	cookieParser = require('cookie-parser'),
	cookieSession = require('cookie-session'),
	serveStatic = require('serve-static'),
	bodyParser = require('body-parser'),
	csrf = require('csurf'),
	helmet = require('helmet'),
	timeout = require('connect-timeout'),
	favicon = require('serve-favicon'),
	http = require('http'),
	util = require('util'),
	formidable = require('formidable');

var async = global.async = require('async');

var _ = global._ = require('lodash');
_.str = require('underscore.string');
_.mixin(_.str.exports());
_.str.include('Underscore.string', 'string');


var rest = require('connect-rest');
var restMaker = require('./restMaker');
global.httphelper = rest.httphelper;


var path = require('path');
var pr = global.pr = require('./services/pathResolver');


var authom = require("authom");
var authenticator = require("./authenticator");



var io = require('socket.io');
var socketer = global.socketer = require("./socketer");


var Mailer = require('./services/mailer');
var mailer;


var connectivity = global.connectivity = require('./connectivity');
var vindication = global.vindication = require('vindication.js');

var mongoose = require('mongoose');
require('mongoose-function')(mongoose);
var schemagen = require('mongoose-schemagen');

var Clerobee = require('clerobee');
var clerobee = global.clerobee = new Clerobee( 32 );



var Renderer = require('./services/renderer');


var Server = function( ) {
	var server;
};

var ServerProto = Server.prototype;

global.isDevelopment = process.env.NODE_ENV === 'development';

ServerProto.init = function( ){
	pr.mapFolders();

	var config = global.config = require('jsonconfig');
	var configs = [
		pr.pathTo( global.codePath, 'server/config/server.json'),
		pr.pathTo( global.codePath, 'server/config/pages.json'),
		pr.pathTo( global.codePath, 'server/config/linkedin.json')
	];
	if( global.isDevelopment )
		configs.push( pr.pathTo( global.codePath, 'server/config/serverDev.json' ) );
	config.load( configs );

	var renderer = global.renderer = new Renderer( _, config.pages );

	mailer = global.mailer = new Mailer( rest.httphelper, global.config.mail );

	global.models = schemagen.readModels( {}, pr.pathTo( global.codePath, 'models'), true );

	this.setupStatics();
};

ServerProto.setupStatics = function( ){
	global.statics = {
	};
};


ServerProto.forceLogin = function( req, res ){
	if(req.session)
		req.session = null;
		//req.session.destroy();

	res.statusCode = 401;
	res.setHeader('REQUIRES_AUTH', '1');
	res.setHeader('Content-Length', '0');
	res.end();
};

ServerProto.cleanSession = function( req, callback ){
	if( req.session && req.session.publicID )
		connectivity.load( global.db.User, {'publicID': req.session.publicID}, false, null, function(err, user){
			if( err || !user )
				req.session = null;
				//req.session.destroy();
			callback();
		} );
	else
		callback();
};

ServerProto.buildUpConnect = function(){
	var self = this;

	if( !http.ServerResponse.prototype.header )
		http.ServerResponse.prototype.header = function(name, value){ this.setHeader(name, value); };

		// 'http://fonts.googleapis.com
	var contentSecurityPolicy = {
		'default-src': ["'self'", "fonts.googleapis.com", "google-analytics.com"],
		'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'" ]
	};


	var app = connect()
		.use( favicon(
			pr.pathTo( global.codePath, 'dist/www/favicon.ico' )
		) )
		//.use( morgan('dev') )
		.use( compression() )
		.use( timeout( 5000 ) )
		.use( cookieParser( process.env.SEC_SESSION_PASS || global.config.server.session.hashSecret ) )
		.use( cookieSession( {
			name: global.config.server.session.name + '.sid',
			secret: process.env.SEC_SESSION_PASS || global.config.server.session.hashSecret,
			cookie: { httpOnly: false }
		} ) )
		.use( csrf( { cookie: { key: 'XSRF-TOKEN', httpOnly: false } } ) )
		//.use( helmet.csp( contentSecurityPolicy ) )
		.use( helmet.xframe('deny') )
		//.use( helmet.xssFilter() )
		//.use( helmet.hsts( { includeSubdomains: true }) )
		.use( helmet.nosniff() )
		.use( helmet.ienoopen() )
		.use( serveStatic( pr.pathTo(global.codePath, 'dist/www') ) )
		.use( function(req, res, next){
			if( req.url === '/storage' && req.method === 'POST'){
				var form = new formidable.IncomingForm();
				form.encoding = 'utf-8';
				form.keepExtensions = true;
				form.maxFieldsSize = global.config.fileSizeLimit || (5 * 1024 * 1024);
				form.uploadDir = pr.newpathTo( global.storagePath, global.config.server.storageFolder );

				form.parse( req, function(err, fields, files ) {
					if(err)
						console.error( err );
					res.writeHead( err ? 500 : 200, {'content-type': 'text/plain'} );
					res.end( err ? '' : files.file.path.substring( files.file.path.indexOf( global.config.server.storageFolder ) ) );
				});
			}
			else
				next();
		} )
		.use( bodyParser.urlencoded( { extended: true } ) )
		.use( bodyParser.json() )
	;

	/*
	console.log('Auth services added...');
	authenticator.buildUpAA( global.config, authom, rest );
	app.use( rest.dispatcher( 'GET', '/auth/:service', authom.app ) );
	*/

	console.log('API security added...');
	app.use( function(req, res, next){
		self.cleanSession( req, function(){
			if( rest.checkCall( req ) )
				next();
			else if( !req.session || !req.session.uid )
				self.forceLogin( req, res );
			else
				next();
		} );
	} );


	var options = {
		context: '/api',
		logger:{ file: global.config.server.logFile, level: global.config.server.logLevel || 'info' }
	};
	console.log('Rest services added...');
	app.use( rest.rester( options ) );

	restMaker.buildUp( rest );


	app.use( function(req, res, next){
		if(req.session)
			req.session = null;
			//req.session.destroy();
		global.renderer.render( 'error', {}, function(err, html){
			res.writeHead( 500, { 'Content-Type' : 'text/html' } );
			res.end( html );
		} );
	} );


	console.log('Server setting up...');
	var port = process.env.PORT || global.config.server.port || 8080;
	var host = process.env.HOST || global.config.server.host;
	var serverParams = [ port ];
	if( host )
		serverParams.push( host );

	var server = this.server = http.createServer(app);


	io = io.listen( server );
	global.io = io;
	socketer.makeSockets();

	server.listen.apply( server, serverParams.concat( function() {
		console.log('Running on http://localhost:8080');
	} ) );
};

ServerProto.close = function( callback ){
	if( this.server )
		this.server.close( function(){ console.log('Node stopped'); } );

	mongoose.connection.close( function(){ console.log('Mongo stopped'); } );

	if( callback )
		callback();
};

ServerProto.serve = function( callback ){
	var self = this;


	connectivity.connectMongo( mongoose, global.config.mongodb, schemagen, vindication, global.models, function( err, db ){
		if( err ){
			console.error( err );
			process.exit(1);
		}

		global.db = db;

		self.buildUpConnect( );

		if( callback ){
			callback();
		}
	} );
};


module.exports = exports = Server;
