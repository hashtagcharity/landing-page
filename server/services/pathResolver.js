var path = require('path');
var mkdirp = require('mkdirp');

exports.mapFolders = function( ){
	global.codePath = __dirname ? (__dirname + '/../../') : process.env.PWD;
	global.storagePath = process.env.CLOUD_DIR ? process.env.CLOUD_DIR : './storage/';
};

exports.pathTo = function( reference, file ){
	return path.join( reference, file || '' );
};

exports.newpathTo = function( reference, folder, file ){
	mkdirp.sync( path.join( reference, folder ) );
	return path.join( reference, folder, file || '' );
};
