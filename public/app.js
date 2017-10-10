(function() {
    //building our module
    var app = angular.module('app', ['ngRoute', 'angular-jwt']);

    /*

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
    }); */

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

        $routeProvider.when('/projects', {
            templateUrl: './templates/projects.html',
            controller: 'ProjectsController',
            controllerAs: 'vm',
            access: {
                restricted: false
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

    app.controller('ProjectsController', ProjectsController);

    function ProjectsController($location, $window, $http, $scope){
        var vm = this;
        vm.title = "ProjectsController";
        projects = [];
        vm.project = {
            nombre: '',
            descripcion: '',
            rfi: '',
            notas: ''
        };

        /*
        vm.testJson = function (){
            $http.get("proyects.json")
                 .then(function(response){
                    //var dat = response.data;
                    console.log(response);
                    $scope.proyectos = response.data;
                    console.log($scope.proyectos);
                 }, function(err){
                     console.log(err);
                 })
        } */

       // vm.testJson();
        vm.getAllProjects = function(){
            $http.get('/api/projects')
                 .then(function(response){
                     var dat = response.data;
                     console.log("data del get all projects " , dat);
                     //vm.polls = response.data;
                     vm.projects = dat;
                 }, function(err){
                     console.log(err);
                 })   
        }
                vm.getAllProjects()

        //crear un nuevo proyecto
        vm.addProject = function(){
            console.log("el proyecto a subir: ", vm.project);
            if(!vm.project){
                console.log('No hay proyecto ara subir');
                return;
            }
            $http.post('/api/projects', vm.project)
                 .then(function(response){
                    console.log("EN POST NEW PROJECT");
                     console.log("resonse dle post en addProject ", response);
                    console.log("a postear: ", vm.project);
                     
                     vm.project = {};
                     vm.getAllProjects();
                 }, function(err){
                     vm.project = {};
                    console.log(err);
                 })  
        }
       

    }

    

    

}())