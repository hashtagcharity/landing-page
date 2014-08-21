var jade = require('jade');

var Renderer = function( _, config, options ) {
	this.config = config || { };
	this.errorPage = null;

	var self = this;
	_.each( config.staticPages, function(value, key, list){
		jade.renderFile( global.codePath + value.path, options || { }, function (err, html) {
			if (err)
				throw err;

			value.page = html;

			if(value.errorPage)
				self.errorPage = html;
		});
	});
};

var RendererProto = Renderer.prototype;

RendererProto.render = function( page, options, callback ){
	var self = this;

	if( this.config.staticPages[ page ] )
		callback( null, this.config.staticPages[ page ].page );

	else if( this.config.dynmamicPages[ page ] ){
		jade.renderFile( global.codePath + this.config.dynmamicPages[ page ].path, options || { }, function(err, html){
			if(err){
				console.error( err );
				callback( self.errorPage ? null : err, self.errorPage );
			}
			else
				callback( null, html);
		} );
	}
	else{
		callback( self.errorPage ? null : new Error('Requested page does not exist!'), self.errorPage );
	}
};

module.exports = exports = Renderer;
