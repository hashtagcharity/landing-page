var async = require('async');
var _ = require('lodash');

var cookie = require('jquery.cookie');

//var ko = require('knockout');
//var knockout_parsley = require('knockout-parsley');
//var knockout_mapper = require('knockout.mapper.js');

//var ViewModel = require('./ViewModel');
//var Countdown = require('./Countdown');

var Services = require('../../abstract/js/Services');
var Interface = require('../../abstract/js/Interface');
var Util = require('../../abstract/js/Util');

require('../../../shim/jquery.fancybox');
require('../../../shim/jquery.fancybox-media');

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

var animationName = [ 'fadeInUp', 'fadeInUp', 'bounceIn', 'fadeInUp', 'bounceIn', 'fadeInUp', 'flipInX' ];
function animate(elements, viewTop, sequence ){
	var hasUnanimated = false;
	elements.each(function( index ) {
		var element = $( this );
		if( element.offset().top < viewTop && !element.hasClass('animated') )
			element.addClass('animated ' + animationName[sequence] );
		hasUnanimated = hasUnanimated || !element.hasClass('animated');
	});
	return hasUnanimated ? sequence : sequence  + 1;
}

function preaperPopup( title, message, confirm, callback ){
	$('#general-title').text( title );
	$('#general-message').text( message );
	$('#general-confirm').text( confirm );
	$('.general-ok').click( function(){
		$('.popup-general').removeClass('animated fadeInUp').addClass('fadeOutDown');
		if( callback )
			callback();
	} );
	$('.popup-general').removeClass('fadeOutDown').addClass('animated fadeInUp');
}

var Controller = (function(){
	return {
		scrollItem: '.ad',
		init: function(){
			/*
			ViewModel.init( function(err, datas){
			} );
			*/
			Interface.sendMail = '/api/interest';
			Interface.getToken = '/api/token';
			/*
			Countdown.init( new Date("June 02, 2014") );
			setInterval( function () {
				var remaining = Countdown.remaining();
				$('#countdown_days').text( remaining[0] );
				$('#countdown_hours').text( remaining[1] );
				$('#countdown_mins').text( remaining[2] );
				$('#countdown_secs').text( remaining[3] );
			}, 1000);
			*/
			this.computeClouds();

			this.animationIndex = 0;

			Util.showNetworkError = function( callback ){
				preaperPopup( 'Network error occurred.', 'Please check your connectivity!', 'OK', callback );
			};
			Util.showMessageModal = function( title, message, callback ){
				preaperPopup( title, message, callback );
			};
		},
		loaded: function(){
			this.reasonCardsItem = $( '.reason-card' );
			this.appImgItem = $( '.app-img' );
			this.countdownerItem = $( '#countdowner' );
			this.campaignLink = $( '.campaign-link' );
			this.testimonialItem = $( '.testimonial' );
			this.teamCardsItem = $( '.team-card' );
			this.weaverItem = $( '.weaver' );
			this.weaverContent = $( '.weaver-content' );
			this.weaverActivator = $( '.weaver-activator' );
			this.socialCard = $('.social-card');

			this.animateWeaver();

			var self = this;
			$('.weaver').mouseenter( function() {
				self.animateWeaver();
			} );
			$('.weaver').mouseleave( function() {
				self.animateWeaver();
			} );
			$('#send-email').click( function(){
				self.sendMailAddress();
			} );

			if( this.isMobileWebkit ){
				$('.scrollReveal').addClass('animated fadeInUp');
			}

			setTimeout(function(){
				$('.mantra').addClass( 'animated fadeInUp' );
			}, 100);
			setTimeout(function(){
				$('.mantra-button').addClass( 'animated pulse' );
			}, 1000);

			console.log('fancybox versionZZ: ' + $.fancybox.version, $('.popup-media') );

			$('.popup-media').fancybox({
				openEffect  : 'none',
				closeEffect : 'none',
				helpers : {
					media : {}
				}
			});
		},
		scroll: function( container ){
			window.requestAnimationFrame(scrollHandler);

			if( !this.isMobileWebkit )
				this.checkAppearance( container );
		},
		resize: function(){
			this.computeClouds();
		},
		computeClouds: function(){
			if( !this.clouds )
				this.clouds = $('.clouds');

			this.screenHeight = $(document).height();

			var screenWidth = $('.ad').width();
			//var scalar = screenWidth <= 400 ? 2.0 : screenWidth <= 1200 ? 1.4 : 1.1;
			var width = screenWidth; //Math.round(screenWidth * scalar);
			var height = Math.round(width / (screenWidth>=400? 1800 : 800) * 400);
			var height_half = Math.round(height / 2);
			var leftShift = Math.round( (width-screenWidth) / -2 );

			this.clouds.css( { width: width + 'px', height: height + 'px', top: -height_half, left: leftShift } );

			$('.cloud-back').css( { width: width + 'px', height: height + 'px', top: ($('.page-app').height() * 0.9), left: leftShift } );
		},
		checkAppearance: function( container ){
			var scrolled = container.scrollTop();
			var viewTop = this.screenHeight - 150;
			if( this.weaverActivator.offset().top < this.screenHeight - 250 )
				this.weaverItem.removeClass('fadeOutDown').addClass('animated fadeInUp');
			else if( this.weaverItem.hasClass('animated') )
				this.weaverItem.removeClass('fadeInUp').addClass('animated fadeOutDown');

			// bounceInLeft, bounceInRight
			switch( this.animationIndex ){
				case 0: this.animationIndex = animate( this.reasonCardsItem, viewTop, 0 ); break;
				case 1: this.animationIndex = animate( this.appImgItem, viewTop, 1 ); break;
				case 2: this.animationIndex = animate( this.testimonialItem, viewTop, 2 ); break;
				case 3: this.animationIndex = animate( this.countdownerItem, viewTop, 3 ); break;
				case 4: this.animationIndex = animate( this.campaignLink, viewTop, 4 ); break;
				case 5: this.animationIndex = animate( this.teamCardsItem, viewTop, 5 ); break;
				case 6: this.animationIndex = animate( this.socialCard, viewTop + 150, 6, true ); break;
			}
		},
		animateWeaver: function( ){
			var self = this;
			if( this.weaverItem.hasClass('open') ){
				this.weaverItem.animate({
					right: "-=" + (this.weaverContent.width() + 30 )
				}, 200, function() {
				});
				self.weaverItem.removeClass('open').addClass('closed');
				$('#weaver_closer').removeClass('hide');
				$('#weaver_opener').addClass('hide');
			}
			else {
				this.weaverItem.animate({
					right: "+=" + (this.weaverContent.width() + 30 )
				}, 200, function() {
				});
				self.weaverItem.removeClass('closed').addClass('open');
				$('#weaver_opener').removeClass('hide');
				$('#weaver_closer').addClass('hide');
			}
		},
		sendMailAddress: function( ){
			// XSRF-TOKEN
			Util.communicate( async.apply( Interface.retrieve, Interface.getToken, null, true ), function(err, data){
				Util.communicate( async.apply( Interface.send, Interface.sendMail, { address: $('#mail-address').val() }, { 'X-CSRF-Token': data.token }, true ), function(err, data){
					if( !err ){
						$('#mail-address').val('');
						Util.showMessageModal( 'A mail has been sent to you!', 'Please, check your inbox!', 'OK' );
					}
					else{
						Util.showNetworkError();
					}
				} );
			} );
		}
	};
})();

global.Controller = Controller;

Services.init( Controller );
