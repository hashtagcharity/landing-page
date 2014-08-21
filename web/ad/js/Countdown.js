var target_date;
var days, hours, minutes, seconds;

module.exports = {
	init: function( date ){
		target_date = date.getTime();
	},
	remaining: function(){
		var current_date = new Date().getTime();
		var seconds_left = (target_date - current_date) / 1000;

		days = parseInt(seconds_left / 86400);
		seconds_left = seconds_left % 86400;

		hours = parseInt(seconds_left / 3600);
		seconds_left = seconds_left % 3600;

		minutes = parseInt(seconds_left / 60);
		seconds = parseInt(seconds_left % 60);

		return [ days, hours, minutes, seconds ];
	}
};
