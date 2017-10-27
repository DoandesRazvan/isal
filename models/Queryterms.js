const mongoose = require('mongoose'),
			Schema = mongoose.Schema;

const QuerytermsSchema = new Schema ({
	term: {
		type: String,
		required: true
	},
	time: {
		type: String,
		required: true
	}
});

mongoose.model('queryterms', QuerytermsSchema);