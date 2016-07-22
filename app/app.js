(function(){
	'use strict';

	var app = angular.module('cosmotle', ['ngRoute']);

	app.config(['$routeProvider',function($routeProvider) {

		var cosmotleMain = {
			templateUrl: 'app/main.html',
			controller: 'CosmotleCtrl',
			resolve: {
				cosmotleData: ['CosmotleServices', function(CosmotleServices){
					return CosmotleServices();
				}]
			}
		}
		$routeProvider.otherwise(cosmotleMain)
		
	}])

	app.controller('CosmotleCtrl', ['$scope', 'cosmotleData', function($scope, cosmotleData){

		console.log(cosmotleData);
		$scope.hello = "Hello World!!!!"

		
	}]);

	app.factory('CosmotleServices', ['$http', '$q', function($http, $q){
		return function cosmotleServices(){
				var free, expense, attendence, defer;

				defer = $q.defer();
				free = $http.get('/free');
				expense = $http.get('/expense');
				attendence = $http.get('/attendence');

				$q.all([free,expense,attendence]).then(function (response) {
					defer.resolve(response);
				});

				return defer.promise;
		};
	}]);

})();