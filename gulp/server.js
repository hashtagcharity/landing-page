var gulp = global.gulp;

gulp.task('server-lint', function() {
	return gulp.src( './server/*.js' )
		.pipe( global.plugins.jshint() )
		.pipe( global.plugins.jshint.reporter('default' ));
});

gulp.task('server-coverage', function (cb) {
	return gulp.src( ['./server/**/*.js'] )
		.pipe( global.plugins.istanbul() )
		.on( 'end', function () {
			gulp.src( ['test/server/*.js'] )
			.pipe( global.plugins.mocha() )
			.on( 'error', function(){ /* ToBeFilled for notifies */ } )
			.pipe( global.plugins.istanbul.writeReports( './dist/coverage/server' ) );
			//.on( 'end', cb );
		} );
});

gulp.task('watch-server', ['server-lint', 'server-coverage'], function() {
	gulp.watch(['./server/**/*.js'], ['server-lint', 'server-coverage'] );
});

exports.buildTasks = ['server-lint', 'server-coverage'];
