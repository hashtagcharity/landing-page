var async = require('async');
var _ = require('lodash');

window.jQuery = $;
var Velocity = require('../../../shim/jquery.velocity.js');
var VelocityUI = require('../../../shim/velocity.ui.js');
//var Velocity = require("imports?window=>{jQuery:$}!../../../shim/jquery.velocity.js");

require('../../../shim/jquery.fancybox');
require('../../../shim/jquery.fancybox-media');


var ko = require('knockout');
//var knockout_parsley = require('knockout-parsley');
var knockout_mapper = require('knockout.mapper.js');

var ViewModel = require('./ViewModel');


var Services = require('../../abstract/js/Services');
var Interface = require('../../abstract/js/Interface');
var Util = require('../../abstract/js/Util');

var screenHeight, topHeight, srollPadding = 0;

var lastPosition = -1, actPosition, whereToScroll, scrollSteps, shift;
function scrollHandler(){
	actPosition = window.pageYOffset;

	if( whereToScroll >= 0 ){
		shift = Math.min( Math.abs( actPosition - whereToScroll ), scrollSteps);
		actPosition += (actPosition < whereToScroll ? shift : -shift);
		window.scrollTo( 0, actPosition );
		if( actPosition === whereToScroll ){
			whereToScroll = -1;
		}
	}

	lastPosition = window.pageYOffset;
}

var Controller = (function(){
	return {
		init: function(){
			Interface.modelPrototypeURI = '/api/model/ToBeFilled';

			ViewModel.init( function(err, datas){
			} );
		},
		loaded: function(){
		},
		scroll: function( container ){
			window.requestAnimationFrame(scrollHandler);
		},
		resize: function(){
		}
	};
})();


Services.init( Controller );
