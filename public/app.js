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
                     //vm.error = err.data.errmsg;
                     vm.error = "Sorry, this name is already taken";
                     console.log("error: ", err); 
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
        console.log("local storage: ", $window.localStorage);
        if($window.localStorage.token){
            console.log("hay localstorage, es usuario");
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

            vm.createMyPoll = function(){
                console.log("vas a crear un poll");
                vm.create = true;
            }

            vm.logOut = function(){
                delete $window.localStorage.token;
                vm.user = null;
                $location.path('/login');
            }
    
            vm.getAllPolls = function(){
                //vm.idUser = id;
                console.log("este es el id del usuario ", id);
                if(user){
                    console.log("usuario");
                }else{
                    console.log("no es usuario");
                }
                $http.get('/api/polls')
                     .then(function(response){
                         var dat = response.data;
                         var cont= 0;
                         console.log("longitud de la data " +dat.length);
                         for(l=0; l< dat.length; l++){
                             if(dat[l].user === id){
                                 cont++;
                                polls.push(dat[l]);
                             }
                         }
                         console.log("cuantos poll tiene este usuario" +cont);
                         console.log("los polls del ususario son: ", polls);
                         //vm.polls = response.data;
                         vm.polls = polls;
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
                         console.log("EN POST NEW POLL");
                         
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
    
            vm.deleteThisPoll = function(thisPoll){
                if(confirm("Are you sure you want to delete this Poll?")){
                    console.log("you want to delete this: " , thisPoll);
                    vm.pollToDelete = thisPoll;
                    vm.pollToDelete.toDelete = true;                  
                    $http.post('/api/polls', vm.pollToDelete)
                        .then(function(response){
                            //vm.poll = {};
                            //vm.getAllPolls();
                        }, function(err){
                            //vm.poll = {};
                        console.log(err);
                    }) 
    
    
                }
            }
        }//fin de si es usuario
        else{
            console.log("no es usuario");
            $location.path('/login');
        }
        

    }//fin del controlador de polls

    app.controller('PollController', PollController);

    function PollController($location, $window, $http, jwtHelper, $scope){
        var vm = this;
        vm.title = "PollController";
        //var user = jwtHelper.decodeToken($window.localStorage.token);
        vm.thisPollId = $location.path().slice(7);
        vm.voted = false;
        console.log("local storage: ", $window.localStorage);

        console.log("Entro al controlador del POll");
        console.log("vm.thisPollId " + vm.thisPollId);
        //console.log("con este usuario ", user);
        
        $http.get('/api/polls/' + vm.thisPollId)
            .then(function(response){
                console.log("response del poll en general ", response);
                console.log("data del poll: ", response.data[0]);
                vm.thisPollIs = response.data[0];
            }, function(err){
                console.log(err);
            })

            console.log('vm.thispollis ' , vm.thisPollIs);  
        vm.voteForThis = function(){
            console.log('you voted for: ' + $scope.selectedOption);
            //console.log("esta autorizado para votar? ", id);
            if($window.localStorage.token){
                console.log("puede votar");
                for(var j=0; j<vm.thisPollIs.options.length; j++){
                    if(vm.thisPollIs.options[j].name === $scope.selectedOption && vm.voted === false){
                        console.log("indice donde esta la opcion seleccionada es " + j);
                        vm.thisPollIs.options[j].votes +=1;
                        vm.voted = "true";
                    }
                }
            }else{
                if(confirm("You need to be logged if you want to vote")){
                    $location.path('/login');
                }
            }
            
            
            $http.post('/api/polls/' + vm.thisPollId, vm.thisPollIs)
                .then(function(response){
                    //$window.localStorage.token = response.data;
                    //vm.thisPollIs = {};
                    //vm.getAllPolls();
                }, function(err){
                    //vm.poll = {};
                console.log(err);
                }) 
            vm.showTheChart();
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
        vm.showTheChart();

        vm.myPolls = function(){
            $location.path('/polls');
        }
        
        vm.addOptionToThisPoll = function(optionName){
            console.log("quieres agregar otra opcion: ", optionName);
            console.log("quieres modificar el poll ", vm.thisPollId);
            console.log("con la info que es: ", vm.thisPollIs);
            vm.newOption = {
                name: optionName,
                votes: 0
            };
            vm.addInput = true;
            console.log("new option: ", vm.newOption);
            vm.thisPollIs.options.push(vm.newOption);
                
            console.log("ahora el nuevo poll es ", vm.thisPollIs);
            console.log("a ver ID", vm.thisPollId);
            $http.post('/api/polls/' + vm.thisPollId, vm.thisPollIs)
                 .then(function(response){
                        console.log("response del post de addOption", response);
                        //$window.localStorage.token = response.data;
                        //vm.thisPollIs = {};
                        //vm.getAllPolls();
                  }, function(err){
                        //vm.poll = {};
                    console.log(err);
                 })     
        }
        
        vm.logOut = function(){
            delete $window.localStorage.token;
            vm.user = null;
            $location.path('/login');
        }
        

    }

}())