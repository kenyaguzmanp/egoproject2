(function() {
    //building our module
    var app = angular.module('app', ['ngRoute', 'angular-jwt', 'angularCSS']);

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
            css: './stylesheets/style.css',
            access: {
                restricted: false
            }
        });

        $routeProvider.when('/projects', {
            templateUrl: './templates/projects.html',
            controller: 'ProjectsController',
            controllerAs: 'vm',
            css: './stylesheets/style.css',
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
        vm.tes = '';

        vm.getAllProjects = function(){
            $http.get('/api/projects')
                 .then(function(response){
                     var dat = response.data;
                     console.log("data del get all projects " , dat);
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
            vm.project.crear = true;
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
            vm.getThisProject(vm.project);       
        }

        //agregar actividad            
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

        //editar proyecto
        vm.editThisProject = function(project){
            vm.edit = true;
            vm.create = false;
            vm.chart = false;
            vm.get = false;
            console.log("en edit project ");
            vm.projectToEdit = project;
            console.log("scope project to edit ", vm.projectToEdit);
            
        }

        //guardar cambios de proyecto
        vm.saveChanges = function (){
            console.log("se guardaran lso cambios del proyecto: ", vm.projectToEdit);
            vm.projectToEdit.cambiar = true;
            $http.post('/api/projects', vm.projectToEdit)
                .then(function(response){
                    console.log("response del post de savechanges", response);
                }, function(err){
                    console.log(err);
                })
            vm.edit = false;
            vm.getThisProject(vm.projectToEdit) 
        }

        //ir al proyecto
        vm.goToThisProject = function(thisProject){             
            console.log("the poll you selected: " , thisProject);
            var id = thisProject._id;
            $location.path("/projects/" + id);                      
        }   

        //tomar determinado proyecto
        vm.getThisProject = function(project){
            vm.get = true;
            vm.create = false;
            vm.chart = false;
            vm.thisProject = project;
            vm.tes = vm.thisProject._id;
            
            var actividadesFormat2 = [];
            for(var f=0; f< vm.thisProject.actividades.length; f++){
                var fechaFormat = vm.thisProject.actividades[f].fecha;
                var dateString = new Date(fechaFormat).toUTCString().split(' ').slice(0, 4).join(' ');
                actividadesFormat2[f] = dateString;
                vm.thisProject.actividades[f].fecha = actividadesFormat2[f];
            }



        }


        //borrar royecto
        vm.deleteThisProject = function(thisproject){
            if(confirm("Are you sure you want to delete this Project?")){
                console.log("you want to delete this: " , thisproject);
                
                vm.projectToDelete = thisproject;  
                vm.projectToDelete.borrar = true;          
                $http.post('/api/projects', vm.projectToDelete)
                    .then(function(response){
                    }, function(err){
                    console.log(err);
                }) 
                vm.getAllProjects()    

            }
        }

        //graficar el proyecto
        vm.graphicThisProject = function(project){
            vm.edit = false;
            vm.create = false;
            vm.get = false;  
            if(project.actividades.length < 1){
                vm.thisProject =  project;
                console.log("no hay actividades para mostrar");
                vm.chart = false;
            }
            else{
                var thisProjectToChart = project;
                        
                var actividadesFormat = [];
                for(var f=0; f< thisProjectToChart.actividades.length; f++){
                    var fechaFormat = thisProjectToChart.actividades[f].fecha;
                    var dateString = new Date(fechaFormat).toUTCString().split(' ').slice(0, 4).join(' ');
                    actividadesFormat[f] = dateString;
                    thisProjectToChart.actividades[f].fecha = actividadesFormat[f];
                }
                vm.thisProject =  thisProjectToChart;
                
                vm.chart = true;
                vm.create = false;
                vm.get = false;
                vm.showTheChart();
            }
            
        }


        vm.showTheChart = function(){
            google.charts.load('current', {'packages':['corechart']});
            google.charts.setOnLoadCallback(drawChart);
            var data =[['Fecha', 'Estimadas', 'Finalizadas']];
            function drawChart() {
                for(var k=0; k<vm.thisProject.actividades.length; k++){
                    var fechaFormat = vm.thisProject.actividades[k].fecha;
                    var dateString = new Date(fechaFormat).toUTCString().split(' ').slice(0, 4).join(' ');
                    console.log("fecha en string " , dateString);
                    data[k+1] = [dateString, vm.thisProject.actividades[k].estimadas, vm.thisProject.actividades[k].finalizadas];                    
                }
                console.log("data: "+ data);
            data = google.visualization.arrayToDataTable(data);        


            var options = {
                title: "Grafico"
            };
                
           var chart = new google.visualization.BarChart(document.getElementById('chart'));    
                chart.draw(data, options);
            }

        }

    }

    

    

}())