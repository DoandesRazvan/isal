const express = require('express'),
			mongoose = require('mongoose'),
			Client = require('node-rest-client').Client,
			client = new Client(),
			app = express();

const port = process.env.PORT || 3000;

const options = {
	headers: {Authorization: 'Client-ID e0670c0bc3fb729'},
	json: true
};

// map global promise - get rid of warning
mongoose.Promise = global.Promise;

// mongodb connect
mongoose.connect('mongodb://fuzyon:1234@ds237445.mlab.com:37445/isal', {
	useMongoClient: true
})
	.then(() => console.log('MongoDB connected'))
	.catch(err => console.log(err));

// load Queryterms model
require('./models/Queryterms');
const Queryterms = mongoose.model('queryterms');

app.get('/imagesearch/:offset', (req, res) => {
	var offset = req.params.offset,
			queryTerm = req.query.q,
			resultsArr = [];

	// entering search term and current time to collection for "/latest" index
	var newQuery = new Queryterms({
		term: queryTerm,
		time: new Date()
	});
	newQuery.save();
	
	// call to imgur api to get the image albums
	client.get(`https://api.imgur.com/3/gallery/search/${offset}?q=${queryTerm}`, options, (results, response) => {
		results.data = results.data.filter((result) => {
			return result.is_album == true;
		});
		
		for (let i = 0; i < results.data.length; i++) {
			let url = results.data[i].link,
					title = results.data[i].title,
					cover = results.data[i].images[0].link,
					views = results.data[i].views;
					
			resultsArr.push({
				url: url,
				title: title,
				cover: cover,
				views: views
			});
			
			if (i > 10) {
				break;
			}
		}
	
		res.json(resultsArr);
	});
});

app.get('/latest', (req, res) => {
		var queryArr = [];
	
		Queryterms.find({})
			.limit(10)
			.sort({time: -1})
			.then(terms => {
				for (let j = 0; j < terms.length; j++) {
					let term = terms[j].term,
							time = terms[j].time;
					
					queryArr.push({
						term: term,
						time: time
					});
				}
			
				res.send(queryArr);
			});
});

app.listen(port);