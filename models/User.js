module.exports = {
	dataModel : {
		publicID: '',
		name: '',
		email: '',
		phone: '',
		linkedin: {
			uid: '',
			token: '',
			secret: '',
			firstName: '',
			lastName: '',
			industry: '',
			publicProfileUrl: '',
			skills: [ '' ],
			summary: ''
		}
	},
	validation : {
		name: { required: true, notblank: true, minlength: 6 },
		email: { required: true, notblank: true, minlength: 6, type: "email" },
		phone: { notblank: true, type: "phone" }
	}
};
