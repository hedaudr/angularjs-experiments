var myApp = angular.module('finApp',['ui.bootstrap']);
myApp.filter('range', function() {
  return function(input, min, max) {
    min = parseInt(min);
    max = parseInt(max);
    for (var i=min; i<=max; i++)
      input.push(i);
    return input;
  };
});
myApp.controller('FinAppCtrl',['$scope','$filter','$http',
	function($scope, $filter, $http){
		console.log("Hello World from Fin app controller");
		//$scope.isCollapsed = true;
	
	 // *********************************************** Initializing months *******************************	
	$scope.months = [      
      {"key": "January",
      "value": "01 - January"},
      {"key": "February",
      "value": "02 - February"},
      {"key": "March",
      "value": "03 - March"},
      {"key": "April",
      "value": "04 - April"},
      {"key": "May",
      "value": "05 - May"},
      {"key": "June",
      "value": "06 - June"},
      {"key": "July",
      "value": "07 - July"},
      {"key": "August",
      "value": "08 - August"},
      {"key": "September",
      "value": "09 - September"},
      {"key": "October",
      "value": "10 - October"},
      {"key": "November",
      "value": "11 - November"},
      {"key": "December",
      "value": "12 - December"}
    ];
		

  // *********************************************** Date functionalities *******************************
  $scope.model = {};  
  
  $scope.today = function() {
    $scope.dt = new Date();
  };
  $scope.today();

  $scope.clear = function () {
    $scope.dt = null;
  };

  // Disable weekend selection
  $scope.disabled = function(date, mode) {
    return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
  };

  $scope.toggleMin = function() {
    $scope.minDate = $scope.minDate ? null : new Date();
  };
  $scope.toggleMin();

  $scope.open = function($event) {
    //$scope.opened = true;
	$event.preventDefault();
    $event.stopPropagation();

	$scope.datepicker = {'opened':true};
  };

  $scope.dateOptions = {
    formatYear: 'yy',
    startingDay: 1
  };

  $scope.formats = ['MM/dd/yyyy', 'dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
  $scope.format = $scope.formats[0];

  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  var afterTomorrow = new Date();
  afterTomorrow.setDate(tomorrow.getDate() + 2);
  $scope.events =
    [
      {
        date: tomorrow,
        status: 'full'
      },
      {
        date: afterTomorrow,
        status: 'partially'
      }
    ];

  $scope.getDayClass = function(date, mode) {
    if (mode === 'day') {
      var dayToCheck = new Date(date).setHours(0,0,0,0);

      for (var i=0;i<$scope.events.length;i++){
        var currentDay = new Date($scope.events[i].date).setHours(0,0,0,0);

        if (dayToCheck === currentDay) {
          return $scope.events[i].status;
        }
      }
    }

    return '';
  };
	
	
	$scope.showForm = function(mode){
		$scope.mode = mode;
		console.log($scope.mode);
		if(	mode === 'new' || mode === 'edit' )
			$scope.showform = true;
		else
			$scope.showform = false;
	}
	
	
	
		var refresh = function(){
			$http.get('/financialapp').success(function(response){
				console.log("I got the data I requested");
				console.log(response);
				$scope.incomelist = response;				
				if($scope.showme){
					$scope.newincome = "";
					$scope.showform = false;
				}
			});
		};
		
		refresh();
	
		$scope.addIncome = function(){
			console.log($scope.newincome);
			var mIncome = null;
			$http.get('/financialapp/'+$scope.newincome.year+'/'+$scope.newincome.payperiod).success(function(response){
				console.log("I got the data I requested for year "+$scope.newincome.year+" & month: "+$scope.newincome.payperiod);
				console.log("response: "+response);
				
				//console.log(response);
				mIncome = response;			
				
				console.log("existing income record: ");
				console.log(mIncome);
				if( mIncome == null || mIncome == undefined ){			
					income = {
						year: $scope.newincome.year,
						payperiod: $scope.newincome.payperiod,
						rate: $scope.newincome.rate,
						comments: $scope.newincome.comments,
						plan: ( $scope.newincome.type == 'P' ? 
						{
							hours: $scope.newincome.hours,
							grosspay: $scope.newincome.grosspay,
							deductions: $scope.newincome.deductions,
							netpay: $scope.newincome.netpay
						}: undefined),
						actual: ( $scope.newincome.type == 'A' ?
						{
							paydate: $filter('date')($scope.newincome.paydate, 'MM/dd/yyyy'),
							hours: $scope.newincome.hours,
							grosspay: $scope.newincome.grosspay,
							deductions: $scope.newincome.deductions,
							netpay: $scope.newincome.netpay
						}: undefined)
					}
					
					$scope.income = income;		

					$http.post('/financialapp', $scope.income).success(function(response){
						console.log("income record inserted");
						console.log(response);
						refresh();
					});
				}else{
					console.log("mIncome is NOT null or undefined & newincome type is "+$scope.newincome.type);
					var mPlan = {};
					var mActual = {};
					if( $scope.newincome.type == 'P' ){
						mPlan.hours = $scope.newincome.hours;
						mPlan.grosspay = $scope.newincome.grosspay;
						mPlan.deductions = $scope.newincome.deductions;
						mPlan.netpay = $scope.newincome.netpay;
						
						console.log(mPlan);
						mIncome.plan = mPlan;
					}else if( $scope.newincome.type == 'A' ){
						mActual.paydate = $filter('date')($scope.newincome.paydate, 'MM/dd/yyyy');
						mActual.hours = $scope.newincome.hours;
						mActual.grosspay = $scope.newincome.grosspay;
						mActual.deductions = $scope.newincome.deductions;
						mActual.netpay = $scope.newincome.netpay;
						
						console.log(mActual);	
						mIncome.actual = mActual;
					}
					
					$scope.income = mIncome;
					
					console.log($scope.income._id);
					$http.put('/financialapp/'+$scope.income._id, $scope.income).success(function(response){
						console.log("income updated");
						refresh();
					});
				}
				
			});	/*-- end of year/month criteria query --*/
			
		};	/*-- end of addIncome method --*/
	
		$scope.edit = function(id, type){			
			$http.get('/financialapp/' + id).success(function(response){
				console.log(response);
				$scope.newincome = response;
				$scope.newincome.type = type;
				if( type == 'P' ){
					$scope.newincome.hours = response.plan.hours;
					$scope.newincome.grosspay = response.plan.grosspay;
					$scope.newincome.deductions = response.plan.deductions;
					$scope.newincome.netpay = response.plan.netpay;
				}else if( type == 'A' ){
					$scope.newincome.hours = response.actual.hours;
					$scope.newincome.grosspay = response.actual.grosspay;
					$scope.newincome.deductions = response.actual.deductions;
					$scope.newincome.netpay = response.actual.netpay;
					$scope.newincome.paydate = response.actual.paydate;
				}
				
				$scope.showform = true;
				$scope.mode = 'edit';
			});
		};	
	
		$scope.updateIncome = function(){
			console.log($scope.newincome._id);
			$http.put('/financialapp/' + $scope.newincome._id, $scope.newincome).success(function(response){
				refresh();
			});
		};
		
	}]);

