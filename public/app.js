(function() {
    //building our module
    var app = angular.module('app', ['ngRoute', 'angular-jwt']);

    app.run(function($http, $rootScope, $location, $window){

        $http.defaults.headers.common['Authorization'] = 'Bearer ' + $window.localStorage.token;

        $rootScope.$on('$routeChangeStart', function(event, nextRoute, currentRoute){
            if(nextRoute.access !== undefined && nextRoute.access.restricted === true && !$window.localStorage.token){
                event.preventDefault();
                $location.path('/login');
            }
            if($window.localStorage.token && nextRoute.access.restricted === true){
                $http.post('/api/verify', {token: $window.localStorage.token})
                     .then(function(response){
                         console.log('Your token is valid');
                     }, function(err){
                         delete $window.localStorage.token;
                         $location.path('/login');
                     })
            }
        });
    });

    app.config(function($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);

        //routes
        $routeProvider.when('/', {
            templateUrl: './templates/main.html',
            controller: 'MainController',
            controllerAs: 'vm',
            access: {
                restricted: false
            }
        });

        $routeProvider.when('/login', {
            templateUrl: './templates/login.html',
            controller: 'LoginController',
            controllerAs: 'vm',
            access: {
                restricted: false
            }
        });

        $routeProvider.when('/register', {
            templateUrl: './templates/register.html',
            controller: 'RegisterController',
            controllerAs: 'vm',
            access: {
                restricted: false
            }
        });

        $routeProvider.when('/polls', {
            templateUrl: './templates/polls.html',
            controller: 'PollsController',
            controllerAs: 'vm',
            access: {
                restricted: false
            }
        });

        $routeProvider.when('/polls/:id', {
            templateUrl: './templates/poll.html',
            controller: 'PollController',
            controllerAs: 'vm',
            access: {
                restricted: false
            }
        });

        $routeProvider.when('/profile', {
            templateUrl: './templates/profile.html',
            controller: 'ProfileController',
            controllerAs: 'vm',
            access: {
                restricted: true
            }
        });

        $routeProvider.otherwise('/');

    });

    //controllers
    app.controller('MainController', MainController);

    function MainController($location, $window){
        var vm = this;
        vm.title = "MainController";
        console.log('in main controller');
    }

    app.controller('LoginController', LoginController);

    function LoginController($location, $window, $http){
        var vm = this;
        vm.title = "LoginController";
        vm.error = '';
        vm.login = function(){
            if(vm.user){
               $http.post('/api/login', vm.user)
                    .then(function(response){
                        $window.localStorage.token = response.data;
                        $location.path('/profile');
                    }, function(err){
                        vm.error = err;
                    }) 
            }else{
                console.log('no credential suppield');
            }
        }

    }

    app.controller('RegisterController', RegisterController);

    function RegisterController($location, $window, $http){
        var vm = this;
        vm.title = "RegisterController";
        vm.error= '';

        vm.register = function(){
            if(!vm.user){
                console.log("invalid user");
                return;
            }
            $http.post('/api/register', vm.user)
                 .then(function(response){
                     //storage on client side
                     $window.localStorage.token = response.data;
                     //redirect
                     $location.path('/profile');
                 }, function(err){
                     vm.error = err.data.errmsg;
                 });
               
        }

    }

    app.controller('ProfileController', ProfileController);

    function ProfileController($location, $window, jwtHelper){
        var vm = this;
        vm.title = "ProfileController";
        vm.user = null;
        var token = $window.localStorage.token;
        var payload = jwtHelper.decodeToken(token).data;
        if(payload){
            vm.user = payload;
        }
        
        vm.logOut = function(){
            delete $window.localStorage.token;
            vm.user = null;
            $location.path('/login');
        }

        vm.myPolls = function(){
            $location.path('/polls');
        }
    }

    app.controller('PollsController', PollsController);

    function PollsController($location, $window, $http, jwtHelper, $scope){
        var vm = this;
        var user = jwtHelper.decodeToken($window.localStorage.token);
        var id = user.data._id;
        vm.title = "PollsController";
        polls = [];
        vm.poll = {
            options: [],
            name: '',
            user: id
        };
        vm.poll.options = [{
            name: '',
            votes: 0
        }];
        vm.addOption =  function (){
            vm.poll.options.push({
                name: '',
                votes: 0
            });
        }

        vm.getAllPolls = function(){
            $http.get('/api/polls')
                 .then(function(response){
                     vm.polls = response.data;
                 }, function(err){
                     console.log(err);
                 })   
        }
                vm.getAllPolls()

        vm.addPoll = function(){
            if(!vm.poll){
                console.log('Invalid data suplied');
                return;
            }
            $http.post('/api/polls', vm.poll)
                 .then(function(response){
                     vm.poll = {};
                     vm.getAllPolls();
                 }, function(err){
                     vm.poll = {};
                    console.log(err);
                 })  
        }

        vm.goToThisPoll = function(thisPoll){             
            console.log("the poll you selected: " , thisPoll);
            var id = thisPoll._id;
            console.log("id " + id);
            vm.selectedPoll = thisPoll;
            $location.path("/polls/" + id);                      
        }

    }

    app.controller('PollController', PollController);

    function PollController($location, $window, $http, jwtHelper, $scope){
        var vm = this;
        vm.title = "PollController";
        //var user = jwtHelper.decodeToken($window.localStorage.token);
        vm.thisPollId = $location.path().slice(7);
        vm.voted = false;

        console.log("Entro al controlador del POll");
        console.log("vm.thisPollId " + vm.thisPollId);
        
        $http.get('/api/polls/' + vm.thisPollId)
            .then(function(response){
                console.log("data del poll: ", response.data[0]);
                vm.thisPollIs = response.data[0];
            }, function(err){
                console.log(err);
            })

            console.log('vm.thispollis ' , vm.thisPollIs);  
        vm.voteForThis = function(){
            console.log('you voted for: ' + $scope.selectedOption);
            for(var j=0; j<vm.thisPollIs.options.length; j++){
                if(vm.thisPollIs.options[j].name === $scope.selectedOption && vm.voted === false){
                    console.log("indice donde esta la opcion seleccionada es " + j);
                    vm.thisPollIs.options[j].votes +=1;
                    vm.voted = "true";
                }
            }
            
            $http.post('/api/polls/' + vm.thisPollId, vm.thisPollIs)
                .then(function(response){
                    //vm.thisPollIs = {};
                    //vm.getAllPolls();
                }, function(err){
                    //vm.poll = {};
                console.log(err);
                }) 
            
        }
        
        vm.showTheChart = function(){
            google.charts.load('current', {'packages':['corechart']});
            google.charts.setOnLoadCallback(drawChart);
            var data =[['Option', 'Votes']];
            function drawChart() {
                for(var k=0; k<vm.thisPollIs.options.length; k++){
                    data[k+1] = [vm.thisPollIs.options[k].name, vm.thisPollIs.options[k].votes];
                }
            data = google.visualization.arrayToDataTable(data);        


            var options = {
                title: vm.thisPollIs.name
            };
                
            var chart = new google.visualization.PieChart(document.getElementById('piechart'));
                
                chart.draw(data, options);
            }

        }
    }

}())