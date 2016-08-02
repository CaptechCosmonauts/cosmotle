(function(){
	'use strict';

	var app = angular.module('cosmotle', ['ngRoute', 'ngCookies']);

	app.config(['$routeProvider',function($routeProvider) {

		var cosmotleWelcome = {
			templateUrl: 'app/welcome.html',
			controller: 'WelcomeCtrl',
			controllerAs: 'w'
		}

		var cosmotleMain = {
			templateUrl: 'app/main.html',
			controller: 'CosmotleCtrl',
			controllerAs: 'c',
			resolve: {
				cosmotleData: ['CosmotleServices', function(CosmotleServices){
					return CosmotleServices.getCosmotleStats();
				}],
        calendarData: ['CosmotleServices', function(CosmotleServices){
            return CosmotleServices.getCosmotleCalendar();
        }]
			}
		}
		var cosmotleCalendar = {
			templateUrl: 'app/calendar.html',
			controller: 'CalendarCtrl',
			controllerAs: 'cal',
			resolve: {
				calendarData: ['CosmotleServices', function(CosmotleServices){
					return CosmotleServices.getCosmotleCalendar();
				}]
			}
		}

		var getCredit = {
			templateUrl: 'app/getCredit.html',
			controller: 'GetCreditCtrl',
			controllerAs: 'g'
		}

		$routeProvider.when('/getcredit', getCredit);
		$routeProvider.when('/calendar', cosmotleCalendar);
		$routeProvider.when('/main', cosmotleMain);
		$routeProvider.when('/', cosmotleWelcome);
		
	}])

	app.controller('WelcomeCtrl', ['CosmotleServices','$location', function(CosmotleServices, $location){
		var w = this;

		w.knownUser = CosmotleServices.isUserKnown();
		w.user;

		if(w.knownUser){
			w.user = CosmotleServices.getUserFromCookie();
			$location.path('/main');
		}

		w.selectUser = function(){
			CosmotleServices.setUserCookie(w.user);
			$location.path('/main');
		}


	}]);

	app.controller('CosmotleCtrl', ['cosmotleData', 'calendarData', '$location', 'CosmotleServices', function(cosmotleData, calendarData, $location, CosmotleServices){
		var c = this;

		//send user to welcome screen if we don't know them
		if(!CosmotleServices.isUserKnown){
			$location.path('/');
		}

  	c.unorganizedCalendar = calendarData[0].data;
  	c.calendar = CalendarUtils.organizeCalendar(calendarData[0].data);

    c.editEvent = function(event){
  		CosmotleServices.eventForUpdate = event;
			$location.path('/calendar');
  	}

		c.free = cosmotleData[0].data;
		c.expense = cosmotleData[1].data;
		c.totalCount = CosmotleServices.getTotalCredit();

		c.toggleFree = false;
		c.toggleExpense = false;
		c.toggleUpcomingEvents = false;

		c.title = "Cosmotle";

		c.toggleStats = function(type){
			if(type === 'expense'){
				c.toggleExpense = (c.toggleExpense === true) ? false : true;
			}
			else if(type === 'free'){
				c.toggleFree = (c.toggleFree === true) ? false : true;
			}
			else if(type === 'events'){
				c.toggleUpcomingEvents = (c.toggleUpcomingEvents === true) ? false : true;
			}
		};

		c.add = function(){
			$location.path('/getcredit');
		}

		c.routeToCalendar = function(){
			CosmotleServices.eventForUpdate = undefined;
			$location.path('/calendar');
		}

	}]);


	app.controller('CalendarCtrl', ['calendarData', '$location', 'CosmotleServices', function(calendarData, $location, CosmotleServices){
		var c = this;
		c.user;
		if(CosmotleServices.isUserKnown()){
			c.user = CosmotleServices.getUserFromCookie();
		}

		c.calendar = calendarData[0].data;
		c.event = {
			_id: {
				$oid: ''
			},
			name: c.user,
			month: '',
			date: ''
		}
		c.new = true;

		c.routeHome = function(){
			$location.path('/');
		}

		c.submit = function(){
			CosmotleServices.postCosmotleCalendar(_createAddEventForPost());
			c.calendar.unshift(c.event);
			_clearEvent();
		};

		c.updateEvent = function(){
			CosmotleServices.putCosmotleCalendar(c.event);
			_clearEvent();
		};

		c.showUpdate = function(event){
			c.event = event;
			c.new = false;
		};

		c.deleteEvent = function(index, event){
			CosmotleServices.deleteCosmotleCalendar(event);
			c.calendar.splice(index, 1);
		};

		c.back = function(){
			$location.path('/main')
		}

		c.backToAdd = function(){
			c.new = true;
			_clearEvent();
		}


		if(CosmotleServices.eventForUpdate){
			c.event = CosmotleServices.eventForUpdate;
			c.showUpdate(c.event);
		}

		var _clearEvent = function(){
			c.event = {
				_id: {
					$oid: ''
				},
				name: c.user,
				month: '',
				date: ''
			}
		}

		//mLab doesn't like _id.$oid on an object for POST
		var _createAddEventForPost = function(){
			var addObj = {
				name: c.event.name,
				month: c.event.month,
				date: c.event.date
			}
			return addObj;
		}

	}]);



	app.controller('GetCreditCtrl', ['$location', 'CosmotleServices', function($location, CosmotleServices){
		var g = this;

		g.user;
		if(CosmotleServices.isUserKnown()){
			g.user = CosmotleServices.getUserFromCookie();
		}
		g.showError = false;

		g.creditUser = function(type){
			g.showError = false;
			CosmotleServices.postCosmotleStats(g.user, type).then(
				function(res){
					g.back();
				},
				function(err){
					g.showError = true;
				}
			);
		}

		g.back = function(){
			g.user = '';
			$location.path('/main');
		}
	}])

	app.factory('CosmotleServices', ['$http', '$q', '$cookies', function($http, $q, $cookies){

		var freeData, expenseData;
		return {
			getCosmotleStats: getCosmotleStats,
			postCosmotleStats: postCosmotleStats,
			getTotalCredit: getTotalCredit,
			getUserFromCookie: getUserFromCookie,
			setUserCookie: setUserCookie,
			isUserKnown: isUserKnown,
			getCosmotleCalendar: getCosmotleCalendar,
			postCosmotleCalendar: postCosmotleCalendar,
			putCosmotleCalendar: putCosmotleCalendar,
			deleteCosmotleCalendar: deleteCosmotleCalendar,
			eventForUpdate: {}
		}

		function getCosmotleStats(){
			var freeReq, expenseReq, defer;

			defer = $q.defer();
			freeReq = $http.get('/cosmostats/free');
			expenseReq = $http.get('/cosmostats/expense');

			$q.all([freeReq,expenseReq]).then(function (response) {
				freeData = response[0].data;
				expenseData = response[1].data;
				defer.resolve(response);
			});

			return defer.promise;	
		}

		function getCosmotleCalendar(){
			var defer, calendar;

			defer = $q.defer();
			calendar = $http.get('/calendar');

			$q.all([calendar]).then(function (response) {
				defer.resolve(response);
			});

			return defer.promise;
		}

		function postCosmotleStats(name, type){
			var defer = $q.defer();
			if(type === 'free'){
				_sendObj(type, name, freeData).then(_success(), _failure());
			}
			else if(type === 'expense'){
				_sendObj(type, name, expenseData).then(_success(), _failure());
			}

			return defer.promise

			function _success(){
				defer.resolve(true);
			}

			function _failure(){
				defer.reject(false);
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
						return $http.put('/cosmostats/'+type+'/'+obj[i]._id.$oid, sendObj);
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

		function setUserCookie(user){
			$cookies.put('user', user);
		}

		function getUserFromCookie(){
			return $cookies.get('user');
		}

		function isUserKnown(){
			var userCookie = getUserFromCookie();
			var isKnown = false;

			if(userCookie){
				isKnown = true;
			}

			return isKnown;
		}

		function postCosmotleCalendar(event){
			$http.post('/calendar/', event);
		}

		function putCosmotleCalendar(event){
			$http.put('/calendar/' + event._id.$oid, event);
		}

		function deleteCosmotleCalendar(event){
			$http.delete('/calendar/' + event._id.$oid, event);
		}

	}]);

})();

var initializeServiceWorker = function(){

	if ('serviceWorker' in navigator) {
	  navigator.serviceWorker.register('/serviceworker.js', { scope: '/' }).then(function(reg) {
			console.log('REGISTERED SW:', reg);
			reg.pushManager.subscribe({
				userVisibleOnly: true
			}).then(function(sub){
				console.log('endpoint:', sub.endpoint);
			});
	  }).catch(function(error) {
	    // registration failed
	    console.log('Registration failed with ' + error);
	  });
	}
}();

var CalendarUtils = function(){
	'use strict';

	return {
		organizeCalendar: organizeCalendar,
		getCalendarDateRange: getCalendarDateRange,
		calculateDateVariance: calculateDateVariance
	};

	function getCalendarDateRange(){
    var range = [];

    var dateToday = new Date();
    var variance = calculateDateVariance();

    var x = 0;
    for(var x = 0; x < range.length; x++){
      arrayHold[x] = {"date":range[x],"name":" ","month":""};
    }

    while(variance.dateBackward != 0){
      range[x] = {"date":dateToday.getDate() - variance.dateBackward,"name":" ","month":""};
      variance.dateBackward--;
      x++;
    }

    range[x] =  {"date":dateToday.getDate(),"name":" ","month":""};
    x++;
    var dateClimb = 1;
    while(variance.dateForward != 0){
      range[x] ={"date":dateToday.getDate() + dateClimb,"name":" ","month":""};
      dateClimb++;
      variance.dateForward--;
      x++
    }
    return range;
	}



	function organizeCalendar(calendarArray){

    var range = getCalendarDateRange();
    var dateToday = new Date();
    var variance = calculateDateVariance();
    var returned = [];
    var count = 0;

    for(var x = 0; x < calendarArray.length; x++){
      var event = calendarArray[x];
      if((event.month == (dateToday.getMonth() +1)) && ((dateToday.getDate() - variance.dateBackward) < event.date < (dateToday.getDate() + variance.dateForward))){
          returned[count] = event;
        count++;
      }
    }

    for(var x = 0; x < range.length; x++){
      for(var y = 0; y < returned.length; y++){
        if((returned[y].date != undefined) && returned[y].date ==  range[x].date){
          range[x] = returned[y];
        }
      }
    }

    return range;
	}

	function calculateDateVariance(){

    var dateToday = new Date();

    var dateForward = 0;
    var dateBackward = 0;
    var nextMonthToo = false;

    switch(dateToday.getDay()){
      case 1:
        dateForward = 4;
        dateBackward= 0;
        break;
      case 2:
        dateForward = 3;
        dateBackward= 1;
        break;
      case 3:
        dateForward = 2;
        dateBackward= 2;
        break;
      case 4:
        dateForward = 1;
        dateBackward= 3;
        break;
      case 5:
        dateForward = 0;
        dateBackward= 4;
        break;
      case 6:
        //Saturday
        dateForward = 7;
        dateBackward= 0;
        break;
      default:
        //Sunday
        dateForward = 6;
        dateBackward= 0;
        break;
    }

    if(dateToday.getDate() + dateForward > 31){
      nextMonthToo;
    }

    return {
      "dateForward": dateForward,
      "dateBackward": dateBackward,
      "nextMonthToo": nextMonthToo,
      "dateToday": dateToday
	  }
	}
}();

