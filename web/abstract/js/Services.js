
(function() {
	var lastTime = 0;
	var vendors = ['ms', 'moz', 'webkit', 'o'];
	for(var x = 0; x < vendors.length && !window.requestAnimationFrame; x += 1) {
		window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
		window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
	}

	if (!window.requestAnimationFrame)
		window.requestAnimationFrame = function(callback, element) {
			var currTime = Date.now ? Date.now() : new Date().getTime();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};

	if (!window.cancelAnimationFrame)
		window.cancelAnimationFrame = function(id) {
			clearTimeout(id);
		};
}());

module.exports = {
	isMobileWebkit: /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent),
	delegate: { },
	init: function( delegate ){
		var self = this;

		this.delegate = delegate;
		delegate.isMobileWebkit = this.isMobileWebkit;

		$(window).on('resize', function() {
			self.resize();
		});
		$(document).ready(function(){
			self.loaded();
		});

		var scrollItem = $( delegate.scrollItem || window );
		scrollItem.on('scroll', function() {
			self.scroll( scrollItem );
		});

		if ( this.isMobileWebkit ) {
			$('.desktop-only').addClass('hide');
		} else
			$('.mobile-only').addClass('hide');

		self.postInit.apply(self, arguments);
	},
	postInit: function(){
		if( this.delegate && this.delegate.init )
			this.delegate.init.apply( this.delegate, arguments);
	},
	loaded: function(){
		if( this.delegate && this.delegate.loaded )
			this.delegate.loaded();
	},
	scroll: function( scrollContainer ){
		if( this.delegate && this.delegate.scroll )
			this.delegate.scroll( scrollContainer );
	},
	resize: function(){
		if( this.delegate && this.delegate.resize )
			this.delegate.resize();
	}
};
