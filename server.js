var express = require('express');
var path = require('path');
var http = require('http');
var https = require('https');
var bodyParser = require('body-parser');
var fs = require('fs');
var cron = require('node-cron');

var app = express();

http.createServer(app).listen(process.env.PORT || 8002);
console.log(__dirname);
app.use('/', express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

cron.schedule('0 0 10 * 8,9 1-5', function(){
	var resData;
	var url = 'https://api.mongolab.com/api/1/databases/heroku_lphx2t8m/collections/endpoints?apiKey=NgGXg3kUA9V4eh_fWe-ponEZCk7EINv2';
		
  https.get(url, function(response){
		console.log('GET PUSH ENDPOINTS FOR JOB STATUS'+ response.statusCode)
		response.on('data', function(data){
			if(!resData){
				resData = data;
			}
			else{
				resData += data;
			}
		});
		response.on('end',function(){

			var endpoints = JSON.parse(resData);
			var endpointParts, registrationId, registrationIds;

			registrationIds = [];
			for(var i = 0; i < endpoints.length; i++){
				endpointParts = endpoints[i].endpoint.split('/');
    		registrationId = endpointParts[endpointParts.length - 1].toString();
    		registrationIds.push(registrationId);
    		console.log(registrationId);
			}

			var dataObj = {registration_ids: registrationIds}
			var post_data = JSON.stringify(dataObj);
			var postOptions = {
				host: 'android.googleapis.com',
				path: '/gcm/send',
				method: 'POST',
				headers: {
					'Authorization': 'key=AIzaSyC-33xCj9fzrMJVMitvEc_blZ7gyeliaTI',
					'Content-Type': 'application/json'
				}
			}

			var request = https.request(postOptions, function(response){
				response.on('data', function(data){
					console.log('POST TEST PUSH STATUS: '+ response.statusCode);
					if(!resData){
						resData = data;
					}
					else{
						resData += data;
					}
				});
				response.on('end', function(){

				});
			});
			request.on('error', function(e){
				console.log('problem with request: ' +e.message);
			});
			console.log(post_data)
			request.write(post_data);
			request.end();
			
		});
	});

});

app.get('/pushendpoints', function(req, res){
	var resData;
	var url = 'https://api.mongolab.com/api/1/databases/heroku_lphx2t8m/collections/endpoints?apiKey=NgGXg3kUA9V4eh_fWe-ponEZCk7EINv2';
	
	res.type('json');
	https.get(url, function(response){
		console.log('GET PUSH ENDPOINTS STATUS'+ response.statusCode)
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

app.post('/pushendpoints', function(req, res){

	var resData;
	var post_data = JSON.stringify(req.body);
	var postOptions = {
		host: 'api.mongolab.com',
		path: '/api/1/databases/heroku_lphx2t8m/collections/endpoints/?apiKey=NgGXg3kUA9V4eh_fWe-ponEZCk7EINv2',
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		}
	}

	var request = https.request(postOptions, function(response){
		response.on('data', function(data){
			console.log('POST PUSH ENDPOINTS STATUS: '+ response.statusCode);
			if(!resData){
				resData = data;
			}
			else{
				resData += data;
			}
		});
		response.on('end', function(){
			res.send(resData);
		});
	});
	request.on('error', function(e){
		console.log('problem with request: ' +e.message);
	});
	request.write(post_data);
	request.end();

});

app.post('/testpush', function(req, res){
//https://android.googleapis.com/gcm/send/
	var resData;
	console.log(req.body)
	var dataObj = { data: { name: 'Matt' },
  registration_ids: [ 'flRBmfY7fxA:APA91bG1oIJrxGH42HVUa-Vfhiy111fHEfGaKGCTizPpboW8R2CDo_lyakQoJFJnw8yZ1z8wG3ka95BipgMv-KM0BqysRTd_L8iFOcmFphmhQZCDXPXEKbBzoP_dIPzO7MjVyglTOnI5','fWL9zSHX7Io:APA91bF6nTJObt5vmgbkO7gNjuE0MGlDGnBSa2r46-Zpx9EwrVbk3fvvC7_I4qEOGIg0lrglBW6A4FJGdwXgr2ALWS9H7CqxbLp7Vl2Dva5POnuRwJFWz2zle1isLOBY6ndvVr5t_CQ-', 'dFoBQL6v8I0:APA91bGzzAURdvI1EXSCJ1kgbiVgf3IHrsPc9NIZjQ97mqwv8fB38LnmAiwVQcFqrQoWhI7b4MXkwHPhysVQLMa5mEF3XAAhrnbUBGNwC1GrLWUl2waxN89lQuEcePkt7g1VfqL3hGOW' ] }

	var post_data = JSON.stringify(dataObj);
	var postOptions = {
		host: 'android.googleapis.com',
		path: '/gcm/send',
		method: 'POST',
		headers: {
			'Authorization': 'key=AIzaSyC-33xCj9fzrMJVMitvEc_blZ7gyeliaTI',
			'Content-Type': 'application/json'
		}
	}

	var request = https.request(postOptions, function(response){
		response.on('data', function(data){
			console.log('POST TEST PUSH STATUS: '+ response.statusCode);
			if(!resData){
				resData = data;
			}
			else{
				resData += data;
			}
		});
		response.on('end', function(){
			res.send(resData);
		});
	});
	request.on('error', function(e){
		console.log('problem with request: ' +e.message);
	});
	console.log(post_data)
	request.write(post_data);
	request.end();

});

app.get('/cosmostats/:type', function(req, res){
	var resData;
	var url = 'https://api.mongolab.com/api/1/databases/heroku_lphx2t8m/collections/'+req.params.type+'?apiKey=NgGXg3kUA9V4eh_fWe-ponEZCk7EINv2';
	
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

app.put('/cosmostats/:type/:id', function(req, res){
	var resData;
	var post_data = JSON.stringify(req.body);
	var postOptions = {
		host: 'api.mongolab.com',
		path: '/api/1/databases/heroku_lphx2t8m/collections/'+req.params.type+'/'+req.params.id+'?apiKey=NgGXg3kUA9V4eh_fWe-ponEZCk7EINv2',
		method: 'PUT',
		headers: {
		  'Content-Type': 'application/json'
		}
	}

	var request = https.request(postOptions, function(response){
		response.on('data', function(data){
			console.log('PUT COSMOTLE STATUS: '+ response.statusCode);
			if(!resData){
				resData = data;
			}
			else{
				resData += data;
			}
		});
		response.on('end', function(){
		    res.send(resData);
		});
	});
	request.on('error', function(e){
		console.log('problem with request: ' +e.message);
	});
	request.write(post_data);
	request.end();
});


app.get('/calendar', function(req, res){

	var resData;
	var url = 'https://api.mongolab.com/api/1/databases/heroku_lphx2t8m/collections/events?apiKey=NgGXg3kUA9V4eh_fWe-ponEZCk7EINv2';

	res.type('json');
	https.get(url, function(response){
		console.log('GET CALENDAR STATUS'+ response.statusCode)
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

app.put('/calendar/:id', function(req, res){

	var resData;
	var post_data = JSON.stringify(req.body);
	var postOptions = {
		host: 'api.mongolab.com',
		path: '/api/1/databases/heroku_lphx2t8m/collections/events/'+req.params.id+'?apiKey=NgGXg3kUA9V4eh_fWe-ponEZCk7EINv2',
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json'
		}
	}

	var request = https.request(postOptions, function(response){
		response.on('data', function(data){
			console.log('PUT CALENDAR STATUS: '+ response.statusCode);
			if(!resData){
				resData = data;
			}
			else{
				resData += data;
			}
		});
		response.on('end', function(){
			res.send(resData);
		});
	});
	request.on('error', function(e){
		console.log('problem with request: ' +e.message);
	});
	request.write(post_data);
	request.end();

});

app.post('/calendar/', function(req, res){

	var resData;
	var post_data = JSON.stringify(req.body);
	var postOptions = {
		host: 'api.mongolab.com',
		path: '/api/1/databases/heroku_lphx2t8m/collections/events/?apiKey=NgGXg3kUA9V4eh_fWe-ponEZCk7EINv2',
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		}
	}

	var request = https.request(postOptions, function(response){
		response.on('data', function(data){
			console.log('POST CALENDAR STATUS: '+ response.statusCode);
			if(!resData){
				resData = data;
			}
			else{
				resData += data;
			}
		});
		response.on('end', function(){
			res.send(resData);
		});
	});
	request.on('error', function(e){
		console.log('problem with request: ' +e.message);
	});
	request.write(post_data);
	request.end();

});

app.delete('/calendar/:id', function(req, res){

	var resData;
	var post_data = JSON.stringify(req.body);
	var postOptions = {
		host: 'api.mongolab.com',
		path: '/api/1/databases/heroku_lphx2t8m/collections/events/'+req.params.id+'?apiKey=NgGXg3kUA9V4eh_fWe-ponEZCk7EINv2',
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json'
		}
	}

	var request = https.request(postOptions, function(response){
		response.on('data', function(data){
			console.log('DELETE CALENDAR STATUS: '+ response.statusCode);
			if(!resData){
				resData = data;
			}
			else{
				resData += data;
			}
		});
		response.on('end', function(){
			res.send(resData);
		});
	});
	request.on('error', function(e){
		console.log('problem with request: ' +e.message);
	});
	request.write(post_data);
	request.end();

});

