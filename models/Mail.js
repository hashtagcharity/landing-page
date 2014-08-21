module.exports = {
	dataModel : {
		address: ''
	},
	validation : {
		address: { required: true, minlength: 6, type: "email" }
	}
};
