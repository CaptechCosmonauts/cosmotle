(function(){
	'use strict';

	var app = angular.module('cosmotle', ['ngRoute']);

	app.config(['$routeProvider',function($routeProvider) {

		var cosmotleMain = {
			templateUrl: 'app/main.html',
			controller: 'CosmotleCtrl',
			controllerAs: 'c',
			resolve: {
				cosmotleData: ['CosmotleServices', function(CosmotleServices){
					return CosmotleServices.getCosmotleStats();
				}]
			}
		}

		var getCredit = {
			templateUrl: 'app/getCredit.html',
			controller: 'GetCreditCtrl',
			controllerAs: 'g'
		}

		$routeProvider.when('/getcredit', getCredit);
		$routeProvider.otherwise(cosmotleMain)
		
	}])

	app.controller('CosmotleCtrl', ['cosmotleData', '$location', 'CosmotleServices', function(cosmotleData, $location, CosmotleServices){
		var c = this;

		c.free = cosmotleData[0].data;
		c.expense = cosmotleData[1].data;
		c.attendence = cosmotleData[2].data;
		c.totalCount = CosmotleServices.getTotalCredit();

		c.toggleFree = false;
		c.toggleExpense = true;
		c.toggleAttendence = false;

		c.title = "Cosmotle"

		c.toggleStats = function(type){
			if(type === 'expense'){
				c.toggleExpense = (c.toggleExpense === true) ? false : true;
			}
			else if(type === 'free'){
				c.toggleFree = (c.toggleFree === true) ? false : true;
			}
			else if(type === 'attendence'){
				c.toggleAttendence = (c.toggleAttendence === true) ? false : true;
			}
		}

		c.add = function(){
			$location.path('/getcredit');
		}

	}]);

	app.controller('GetCreditCtrl', ['$location', 'CosmotleServices', function($location, CosmotleServices){
		var g = this;

		g.user;

		g.creditUser = function(type){
			CosmotleServices.postCosmotleStats(g.user, type);
			g.back();
		}

		g.back = function(){
			g.user = '';
			$location.path('/');
		}
	}])

	app.factory('CosmotleServices', ['$http', '$q', function($http, $q){

		var freeData, expenseData, attendenceData;
		return {
			getCosmotleStats: getCosmotleStats,
			postCosmotleStats: postCosmotleStats,
			getTotalCredit: getTotalCredit
		}

		function getCosmotleStats(){
			var freeReq, expenseReq, attendenceReq, defer; 

			defer = $q.defer();
			freeReq = $http.get('/cosmostats/free');
			expenseReq = $http.get('/cosmostats/expense');
			attendenceReq = $http.get('/cosmostats/attendence');

			$q.all([freeReq,expenseReq,attendenceReq]).then(function (response) {
				freeData = response[0].data;
				expenseData = response[1].data;
				attendenceData = response[2].data;
				defer.resolve(response);
			});

			return defer.promise;	
		}

		function postCosmotleStats(name, type){

			if(type === 'free'){
				_sendObj(type, name, freeData);
				_sendObj('attendence', name, attendenceData);

			}
			else if(type === 'expense'){
				_sendObj(type, name, expenseData);
				_sendObj('attendence', name, attendenceData);
			}
			else if(type === 'attendence'){
				_sendObj(type, name, attendenceData);
			}

			function _sendObj(type, name, obj){
				var sendObj = {
					_id:{
						$oid: ''
					},
					name: name,
					count: ''
				}
				for(var i=0; i< obj.length; i++){
					if(obj[i].name === name){
						sendObj._id.$oid = obj[i]._id.$oid;
						sendObj.count = (Number(obj[i].count)+1).toString();
						$http.put('/cosmostats/'+type+'/'+obj[i]._id.$oid, sendObj);
					}
				}
			}
			
		}

		function getTotalCredit(){

			return (_countCredit(freeData) + _countCredit(expenseData)).toString();

			function _countCredit(obj){
				var counter = 0;
				for(var i=0; i< obj.length; i++){
					counter = counter + Number(obj[i].count);
				}

				return counter;
			}

		}
		
	}]);

})();