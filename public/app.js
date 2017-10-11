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

        $routeProvider.when('/projects/:id', {
            templateUrl: './templates/project.html',
            controller: 'ProjectController',
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

    app.controller('ProjectController', ProjectController);
    
        function ProjectController($location, $window, $http){
            var vm = this;
            vm.title = "ProjectController";
            console.log('in proyect controller');
            vm.thisProjectId = $location.path().slice(10);
            console.log("thisprojectid " + vm.thisProjectId);
            
            $http.get('/api/projects/' + vm.thisProjectId)
                .then(function(response){
                    console.log("response del project en general ", response.data);
                   // console.log("data del poll: ", response.data[0]);
                   vm.thisProject = response.data[0];
                }, function(err){
                    console.log(err);
                })
                
            vm.showTheChart = function(){
                google.charts.load('current', {'packages':['corechart']});
                google.charts.setOnLoadCallback(drawChart);
                var data =[['Fecha', 'Estimadas', 'Finalizadas']];
                function drawChart() {
                    for(var k=0; k<vm.thisProject.actividades.length; k++){
                        data[k+1] = [vm.thisProject.actividades[k].fecha, vm.thisProject.actividades[k].estimadas, vm.thisProject.actividades[k].finalizadas];
                    }
                    console.log("data: "+ data);
                data = google.visualization.arrayToDataTable(data);        


                var options = {
                    title: "Grafico"
                };
                    
                //var chart = new google.visualization.PieChart(document.getElementById('piechart'));
               var chart = new google.visualization.BarChart(document.getElementById('piechart'));    
                    chart.draw(data, options);
                }

            }
            vm.showTheChart();    
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
        
        vm.project.actividades = [];
        vm.actividad = {
            fecha: '',
            estimadas: '',
            finalizadas: ''
        };


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

        vm.createProject = function (){
            vm.create = true;
            vm.chart = false;
            vm.get = false;
        }        

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

            
        vm.addActivity = function(){
            vm.activitiesButton = false;
            console.log("la actividad a subir ", vm.actividad);
            vm.project.actividades.push(vm.actividad);
            console.log("las actividades totales son: ", vm.project.actividades); 
            vm.actividad = {
                fecha: '',
                estimadas: '',
                finalizadas: ''
            };
        }

        vm.editThisProject = function(project){
            vm.edit = true;
            console.log("en edit project ");
            vm.projectToEdit = project;
            console.log("scope project to edit ", vm.projectToEdit);
        }

        vm.saveChanges = function (){
            console.log("se guardaran lso cambios del proyecto: ", vm.projectToEdit);
            vm.projectToEdit.cambiar = true;
            $http.post('/api/projects', vm.projectToEdit)
                .then(function(response){
                    console.log("response del post de savechanges", response);
                    //$window.localStorage.token = response.data;
                    //vm.thisPollIs = {};
                    //vm.getAllPolls();
                }, function(err){
                    //vm.poll = {};
                console.log(err);
                }) 
        }


        vm.goToThisProject = function(thisProject){             
            console.log("the poll you selected: " , thisProject);
            var id = thisProject._id;
           // console.log("id " + id);
           // vm.selectedPoll = thisPoll;
            $location.path("/projects/" + id);                      
        }

        vm.getThisProject = function(project){
            vm.get = true;
            vm.create = false;
            vm.thisProject = project;
        }

        vm.graphicThisProject = function(project){
            console.log(project);
            vm.thisProject = project;
            vm.chart = true;
            vm.create = false;
            vm.get = false;
            vm.showTheChart();
        }

        vm.showTheChart = function(){
            google.charts.load('current', {'packages':['corechart']});
            google.charts.setOnLoadCallback(drawChart);
            var data =[['Fecha', 'Estimadas', 'Finalizadas']];
            function drawChart() {
                for(var k=0; k<vm.thisProject.actividades.length; k++){
                    data[k+1] = [vm.thisProject.actividades[k].fecha, vm.thisProject.actividades[k].estimadas, vm.thisProject.actividades[k].finalizadas];
                }
                console.log("data: "+ data);
            data = google.visualization.arrayToDataTable(data);        


            var options = {
                title: "Grafico"
            };
                
            //var chart = new google.visualization.PieChart(document.getElementById('piechart'));
           var chart = new google.visualization.BarChart(document.getElementById('chart'));    
                chart.draw(data, options);
            }

        }

    }

    

    

}())