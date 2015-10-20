var express = require('express');
var app = express();
var mongojs = require('mongojs');
var db = mongojs('finances',['finances']);
var bodyParser = require('body-parser');
var util = require('util');

app.use(express.static(__dirname + "/public"))
app.use(bodyParser.json());

app.get('/financialapp', function(req, resp){
	console.log("I received a GET request");
	/*
	income1 = {
		year: '2015',
		payperiod: 'July',		
		rate: '50',
		//hrsdiff: '7.75',
		plan: {
			hours: '160',
			grosspay: '5435',
			deductions: '1200',
			netpay: '4235'
		},
		actual: {
			paydate: '07/03/2015',
			hours: '152.25',
			grosspay: '5000',
			deductions: '1000',
			netpay: '4000'
		}
	};
	income2 = {
		year: '2015',
		payperiod: 'June',
		rate: '50',
		plan:{
			hours: '184',
			grosspay: '7435',
			deductions: '1200',
			netpay: '5235'
		},
		actual: {
			paydate: '06/03/2015',
			hours: '170.25',		
			grosspay: '7000',
			deductions: '2000',
			netpay: '5000'
		}
	};
	income3 = {
		year: '2014',
		payperiod: 'July',		
		rate: '40',
		plan: {
			hours: '160',
			grosspay: '4235',
			deductions: '1200',
			netpay: '3435'
		},
		actual: {
			paydate: '07/03/2014',
			hours: '152.25',
			grosspay: '4000',
			deductions: '1000',
			netpay: '3000'
		}
	};
	income4 = {
		year: '2014',
		payperiod: 'June',		
		rate: '40',
		plan: {
			hours: '184',
			grosspay: '5235',
			deductions: '1200',
			netpay: '4435'
		},
		actual: {
			paydate: '06/03/2014',
			hours: '170.25',		
			grosspay: '5000',
			deductions: '1000',
			netpay: '4000'
		}
	};
	var incomelist = [income1, income2, income3, income4];
	resp.json(incomelist);
	*/
	var findAllOptions = {
		"sort": ["payperiod","desc"]
	}

	db.finances.find().sort({ payperiod:-1 }, function(err, docs){
		//console.log(docs);
		if(err) { 
			console.log(err);
			return resp.status(500).send(err); 
		}
		resp.json(docs);
	});
		
});

app.post('/financialapp', function(req, resp){
	console.log(req.body);
	db.finances.insert(req.body, function(err, doc){
		resp.json(doc);
	});
});

app.put('/financialapp/:id', function(req, resp){
	var id = req.params.id;
	console.log("In put");
	console.log(req.body);	
	delete req.body._id;
	
	db.finances.findAndModify({
		query: { _id: mongojs.ObjectId(id) },
		update: { $set: req.body },
		new: true
	}, function(err, doc){
		if(err) { 
			console.log(err);
			return resp.status(500).send(err); 
		}
		console.log("record updated");
		console.log(doc);
		resp.json(doc);
	});
});

app.get('/financialapp/:id', function(req, resp){
	var id = req.params.id;
	console.log(id);
	db.finances.findOne({_id: mongojs.ObjectId(id)}, function(err, doc){
		resp.json(doc);
	});
});
app.get('/financialapp/:year/:month', function(req, resp){	
	var yr = req.params.year;
	var mnth = req.params.month;
	console.log(mnth+' : '+yr);
	var query = {};
	query['year'] = parseInt(yr);
	query['payperiod'] = mnth;
	console.log("query- "+util.inspect(query, false, null) );
	db.finances.findOne(query, function(err, doc){
		console.log("returned doc: "+doc);
		resp.json(doc);
	});
});

app.delete('/financialapp/:id', function(req, resp){
	var id = req.params.id;
	console.log(id);
	db.finances.remove({_id: mongojs.ObjectId(id)}, function(err, doc){
		resp.json(doc);
	});
});

app.listen(3000);
console.log("Server running on port 3000");