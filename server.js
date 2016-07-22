var express = require('express');
var path = require('path');
var http = require('http');
var https = require('https');
var bodyParser = require('body-parser');
var fs = require('fs');

var app = express();

http.createServer(app).listen(process.env.PORT || 8002);
console.log(__dirname);
app.use('/', express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/free', function(req, res){
	var resData;
	var url = 'https://api.mongolab.com/api/1/databases/heroku_lphx2t8m/collections/free?apiKey=NgGXg3kUA9V4eh_fWe-ponEZCk7EINv2';
	
	res.type('json');
	https.get(url, function(response){
		console.log('GET COSMOTLE STATUS'+ response.statusCode)
		response.on('data', function(data){
			if(!resData){
				resData = data;
			}
			else{
				resData += data;
			}
		});
		response.on('end',function(){
			res.send(resData);
		});
	});
});

app.get('/expense', function(req, res){
	var resData;
	var url = 'https://api.mongolab.com/api/1/databases/heroku_lphx2t8m/collections/expense?apiKey=NgGXg3kUA9V4eh_fWe-ponEZCk7EINv2';
	
	res.type('json');
	https.get(url, function(response){
		console.log('GET COSMOTLE STATUS'+ response.statusCode)
		response.on('data', function(data){
			if(!resData){
				resData = data;
			}
			else{
				resData += data;
			}
		});
		response.on('end',function(){
			res.send(resData);
		});
	});
});

app.get('/attendence', function(req, res){
	var resData;
	var url = 'https://api.mongolab.com/api/1/databases/heroku_lphx2t8m/collections/attendence?apiKey=NgGXg3kUA9V4eh_fWe-ponEZCk7EINv2';
	
	res.type('json');
	https.get(url, function(response){
		console.log('GET COSMOTLE STATUS'+ response.statusCode)
		response.on('data', function(data){
			if(!resData){
				resData = data;
			}
			else{
				resData += data;
			}
		});
		response.on('end',function(){
			res.send(resData);
		});
	});
});