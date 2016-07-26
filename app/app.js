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
				cosmotleData: ['CosmotleServices', function(CosmotleServices){
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
		$routeProvider.otherwise(cosmotleMain)
		
	}])

	app.controller('CosmotleCtrl', ['cosmotleData', 'calendarData', '$location', 'CosmotleServices', function(cosmotleData, calendarData, $location, CosmotleServices){
		var c = this;

        c.unorganizedCalendar = calendarData[0].data;
        c.calendar = organizeCalendar(calendarData[0].data);

        console.log(c.calendar);

		c.free = cosmotleData[0].data;
		c.expense = cosmotleData[1].data;
		c.attendence = cosmotleData[2].data;
		c.totalCount = CosmotleServices.getTotalCredit();

		c.toggleFree = false;
		c.toggleExpense = true;
		c.toggleAttendence = false;

		c.title = "Cosmotle";

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
		};

		c.add = function(){
			$location.path('/getcredit');
		}

	}]);


	app.controller('CalendarCtrl', ['cosmotleData', '$location', 'CosmotleServices', function(cosmotleData, $location, CosmotleServices){
		var c = this;
		c.name = "";
        c.month = "";
		c.date = "";
		c.update = false;
		c.new = true;
		c.updateId = "";

		c.calendar = cosmotleData[0].data;

		c.submit = function(){
			console.log(c.name +  " " + c.date);
			CosmotleServices.postCosmotleCalendar(c.name, c.month, c.date);
			$location.path('/calendar');
		};

		c.updateEvent = function(){
			console.log(c.name +  " " + c.date);
			CosmotleServices.putCosmotleCalendar(c.name, c.month, c.date, c.updateId);
			$location.path('/calendar');
		};

		c.showUpdate = function(id, name, month, date){
			c.name = name;
            c.month = month;
			c.date = date;
			c.updateId = id;
			c.update = true;
			c.new = false;
		};

		c.deleteEvent = function(id, name, month, date){
			c.name = name;
            c.month = month;
			c.date = date;
			c.updateId = id;
			console.log("deleting event in controller");
			console.log(c.name +  " " + c.date);
			CosmotleServices.deleteCosmotleCalendar(c.name, c.month, c.date, c.updateId);
			$location.path('/calendar');
		};


	}]);



	app.controller('GetCreditCtrl', ['$location', 'CosmotleServices', function($location, CosmotleServices){
		var g = this;

		g.user;
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
			$location.path('/');
		}
	}])

	app.factory('CosmotleServices', ['$http', '$q', function($http, $q){

		var freeData, expenseData, attendenceData;
		return {
			getCosmotleStats: getCosmotleStats,
			postCosmotleStats: postCosmotleStats,
			getCosmotleCalendar: getCosmotleCalendar,
			postCosmotleCalendar: postCosmotleCalendar,
			putCosmotleCalendar: putCosmotleCalendar,
			deleteCosmotleCalendar: deleteCosmotleCalendar,
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
				_sendObj('attendence', name, attendenceData);

			}
			else if(type === 'expense'){
				_sendObj(type, name, expenseData).then(_success(), _failure());
				_sendObj('attendence', name, attendenceData);
			}
			else if(type === 'attendence'){
				_sendObj(type, name, attendenceData).then(_success(), _failure());
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

		function postCosmotleCalendar(name, month, date){

			var sendObj = {
				name: name,
                month: month,
				date: date
			}

			$http.post('/calendar/', sendObj);

		}

		function putCosmotleCalendar(name, month, date, id){
			var sendObj = {
				_id:{
					$oid: id
				},
				name: name,
                month: month,
				date: date
			}


			$http.put('/calendar/' + id, sendObj);


		}

		function deleteCosmotleCalendar(name, month, date, id){
			console.log("deleteing ID" + id);
			var sendObj = {
				_id:{
					$oid: id
				},
				name: name,
                month: month,
				date: date
			}


			$http.delete('/calendar/' + id, sendObj);


		}

	}]);

})();


function getCalendarDateRange(){
    var range = [];

    var dateToday = new Date();
    var variance = calculateDateVariance();

    var x = 0;
    for(var x = 0; x < range.length; x++){
        arrayHold[x] = {"date":range[x],"name":"","month":""};
    }

    while(variance.dateBackward != 0){
        range[x] = {"date":dateToday.getDate() - variance.dateBackward,"name":"","month":""};
        variance.dateBackward--;
        x++;
    }

    range[x] =  {"date":dateToday.getDate(),"name":"","month":""};
    x++;
    var dateClimb = 1;
    while(variance.dateForward != 0){
        range[x] ={"date":dateToday.getDate() + dateClimb,"name":"","month":""};
        dateClimb++;
        variance.dateForward--;
        x++
    }
    return range;
}



function organizeCalendar(calendarArray){

    var range = getCalendarDateRange();

    console.log(calendarArray);
    var dateToday = new Date();
    console.log(dateToday.getDay());

    var variance = calculateDateVariance();

    var returned = [];

    var count = 0;
    for(var x = 0; x < calendarArray.length; x++){
        var event = calendarArray[0];
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

    return returned = {
        "dateForward": dateForward,
        "dateBackward": dateBackward,
        "nextMonthToo": nextMonthToo,
        "dateToday": dateToday
    }

}