var gulp = global.gulp;

var gutil = require("gulp-util");
var webpack = require("webpack");

var path = require( 'path' );
var connect = require('gulp-connect');

var path = require( 'path' );

var jeet = global.jeet = require("jeet");
var nib = global.nib = require('nib');
var rupture = global.rupture = require('rupture');


gulp.task('clean', function( ) {
	return gulp.src(['./dist'], {read: false})
	.pipe( global.plugins.rimraf( { force: true } ) );
});

gulp.task('web-lint', function() {
	return gulp.src( 'web/**/*.js' )
	.pipe( global.plugins.jshint() )
	.pipe( global.plugins.jshint.reporter('default' ));
});

gulp.task('connect', function() {
	connect.server( {
		root: 'dist/www',
		livereload: true
	} );
});

gulp.task('reload', function () {
	gulp.src( ['dist/**/*.html', 'dist/**/*.css', 'dist/**/*.js'] )
	.pipe(connect.reload());
});

gulp.task( 'copyStatic', [ 'web-lint' ], function( ) {
	return gulp.src( 'web/static/**/*' )
	.pipe( gulp.dest('./dist/www') );
});





var buildTasks = [ 'clean', 'web-lint', 'copyStatic' ];

['ad'].forEach( function(element){
	var watchGulp = 'watch-' + element, designGulp = 'design-' + element, buildGulp = 'build-' + element, stylusGulp = 'stylus-' + element, jadeGulp = 'jade-' + element, webpackGulp = 'webpack-' + element; 
	var config = {
		cache: true,
		entry: './web/' + element + '/js/main.js',
		output: {
			path: path.join(__dirname, '../dist/www/js'),
			filename: element + '.js',
			publicPath: '/dist/www' //path.join(__dirname, '../../dist/www/')
		},
		module: {
			noParse: [
				/Gulpfile\.js$/,
				/.\.json$/,
				/.\.txt$/,
				/\.gitignore$/,
				/\.jshintrc$/
			]
		},
		plugins: [
			new webpack.ProvidePlugin({
				jQuery: "jquery",
				$: "jquery",
				Validator: 'parsleyjs/dist/parsley.js'
			})
		]
	};
	gulp.task(webpackGulp, function( callback ) {
		webpack( config, function(err, stats) {
			if(err){
				throw new gutil.PluginError("webpack", err);
			}
			gutil.log("[webpack]", stats.toString({
				// output options
			}));
			callback();
		});
	});

	gulp.task(stylusGulp, function ( cb ) {
		return gulp.src('./web/' + element + '/styles/' + element + '.styl')
			.pipe( global.plugins.stylus( { errors: true, use: [ global.jeet(), global.nib(), global.rupture() ], compress: !global.argv.development } ) )
			//.pipe( global.plugins.autoprefixer( 'last 2 version',  'Safari >= 7', 'ios >= 7', 'ie >= 10', 'Android 4' ) )
			//.pipe( global.plugins.csslint() )
			//.pipe( global.plugins.csslint.reporter() )
			.pipe( global.plugins.minifyCss( { keepBreaks: global.argv.development } ) )
			.pipe( gulp.dest('./dist/www/css') );
	});

	gulp.task(jadeGulp, function( cb ) {
		var YOUR_LOCALS = {};
		return gulp.src('./web/' + element + '/views/index.jade')
			.pipe( global.plugins.jade( { locals: YOUR_LOCALS, pretty: global.argv.development } ) )
			.pipe( gulp.dest('./dist/www') );
	});

	gulp.task( watchGulp, ['connect', stylusGulp, jadeGulp, webpackGulp], function() {
		gulp.watch(['./web/abstract/**/*.styl', './web/' + element - '/**/*.styl'], [ stylusGulp, 'reload'] );

		gulp.watch(['./web/abstract/**/*.jade', './web/' + element - '/**/*.jade'], [ jadeGulp, 'reload'] );

		gulp.watch(['./node_modules/*/package.json'], [ webpackGulp ] );

		gulp.watch(['./web/abstract/**/*.js', './web/' + element - '/**/*.js'], [ webpackGulp, 'reload'] );
	});

	gulp.task( designGulp, [ stylusGulp, jadeGulp ], function( cb ) { cb(); });

	gulp.task( buildGulp, [ stylusGulp, webpackGulp, jadeGulp ], function( cb ) { cb(); });

	buildTasks = buildTasks.concat( stylusGulp, webpackGulp, jadeGulp );
} );

exports.buildTasks = buildTasks;
