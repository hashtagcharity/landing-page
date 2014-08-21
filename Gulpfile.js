var argv = global.argv = require('minimist')(process.argv.slice(2));
var path = require('path');
var gulp = global.gulp = require('gulp'),
	plugins = global.plugins = require("gulp-load-plugins")( { scope: ['devDependencies'] } );

var runSequence = require('run-sequence');


var server = require('./gulp/server' );
gulp.task( 'build-server', server.buildTasks );



var web = require('./gulp/web' );
gulp.task( 'build-web', function(callback) {
	runSequence.apply( this, web.buildTasks.concat( callback ) );
} );


gulp.task( 'build', function(callback) {
	runSequence.apply( this, [].concat( server.buildTasks ).concat( web.buildTasks ).concat( callback ) );
} );

gulp.task( 'default', [ 'build' ] );
