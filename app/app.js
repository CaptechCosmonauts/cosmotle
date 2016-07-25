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

	app.controller('CosmotleCtrl', ['cosmotleData', '$location', function(cosmotleData, $location){
		var c = this;

		c.free = cosmotleData[0].data;
		c.expense = cosmotleData[1].data;
		c.attendence = cosmotleData[2].data;
		c.totalCount;

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
		g.creditType;

		g.back = function(type){
			console.log('User: '+ g.user + ' Type: '+ type);
			CosmotleServices.postCosmotleStats(g.user, type);
			$location.path('/');
		}
	}])

	app.factory('CosmotleServices', ['$http', '$q', function($http, $q){

		var holdStats;
		return {
			getCosmotleStats: getCosmotleStats,
			postCosmotleStats: postCosmotleStats
		}

		function getCosmotleStats(){
			var free, expense, attendence, defer;

			defer = $q.defer();
			free = $http.get('/free');
			expense = $http.get('/expense');
			attendence = $http.get('/attendence');

			$q.all([free,expense,attendence]).then(function (response) {
				holdStats = response;
				defer.resolve(response);
			});

			return defer.promise;	
		}

		function postCosmotleStats(name, type){
			var freeObj, expenseObj, attendenceObj, sendId;

			if(type === 'free'){
				_sendObj(type, name, holdStats[0].data);
				_sendObj('attendence', name, holdStats[2].data);

			}
			else if(type === 'expense'){
				_sendObj(type, name, holdStats[1].data);
				_sendObj('attendence', name, holdStats[2].data);
			}
			else if(type === 'attendence'){
				_sendObj(type, name, holdStats[2].data);
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
						$http.put('/'+type+'/'+obj[i]._id.$oid, sendObj);
					}
				}
			}
			
		}
		
	}]);

})();