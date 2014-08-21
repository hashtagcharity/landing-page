var rest = require('connect-rest');

var Mailer = require('../server/services/mailer');

var mailer = new Mailer( rest.httphelper,
	{
		url: "https://api.mailgun.net/v2/hashtagcharity.org/messages",
		api_key: "key-195k6pt8scxfx-60f-qhf22ornmrrlq1",
		interest: {
			from: "#CHARITY <info@hashtagcharity.org>",
			to: "MAIL_RECIPIENT",
			subject: "DO NOT REPLY - Welcome to #charity!",
			text: "Thank you for your interest!\n\nWe are working hard building up our platform and help people find worthy causes, apply IT skills and make meaningful difference.\nIf you have any questions, comments or a great idea please contact us - your feedback is appreciated.\n\nWe will keep you posted about our progress,\n#charity Team.",
			html: "mailGreetings.html"
		}
	}
);

mailer.sendMail( 'interest', 'imre.fazekas@gmail.com', function(err, res){
	console.log( err, res );
} );
