var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('jVROT_yrBEMrBRCfeUNBAg');


var fs = require('fs');

var mailCache = {};

var Mailer = function( httphelper, config ) {
	this.httphelper = httphelper;
	this.config = config;
};

var MailerProto = Mailer.prototype;

//var logoBuffer = fs.readFileSync( 'charity_logo.png' );

MailerProto.sendMail = function( type, to, callback ){
	var username = 'api';
	var api_key = global.config.mail.api_key;

	var headers = {};
	var b = new Buffer([username, api_key].join(':'));
	headers.Authorization = "Basic " + b.toString('base64');

	var data = global._.clone( this.config[ type ] );
	data.to = [{
		"email": to,
		"type": "to"
	}];

	if( data.html ){
		if( !mailCache[ type ] )
			mailCache[ type ] = fs.readFileSync( global.pr.pathTo( global.codePath, 'server/services/' + data.html ), { encoding: "UTF-8"} );
		data.html = mailCache[ type ];
	}

	mandrill_client.messages.send({
		"message": data, "async": true
	}, function(result) {
		callback(null, result);
	}, function( err ) {
		callback( err );
	});

	/*
	this.httphelper.generalCall( global.config.mail.url, 'POST', headers, null, data, 'application/x-www-form-urlencoded', null, function(err, res){
		callback( err, res );
	} );
	*/
};

module.exports = exports = Mailer;
