var express = require('express');
var router = express.Router({ caseSensitive: true });
var bcrypt = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');
//var User = require('../models/user');
//var Poll = require('../models/polls');
var Project = require('../models/projects');

/*
router.post('/polls/:id', function(request, response){
    console.log("EN POST DEL POLL ESPECIFICO");
    //console.log("RESPONSE EN EL POST:  ", response.req.headers.authorization);
    //console.log("TOKEN: ", request.body);
    var pollToUpdateId = request.body._id;
    var optionsToUpdate = request.body.options;
    console.log("poll id to be updated", pollToUpdateId);
    console.log("options to be updated: ", optionsToUpdate);
    
    Poll.update({ _id: pollToUpdateId},{ $set: {options : optionsToUpdate}}, function(err, response){
        console.log("actualizando en bd");
        if(err){
            return response.status(400).send(err)
        }
        console.log("response en actualizacion de bd ", response);
    }) 
    

}); */



router.get('/projects/:id', function(request, response){
    console.log("ENTRO A PROYECTO");
    //console.log("request del poll en get REMOTE ADDRESS", request.connection.remoteAddress);
    var idProject = request.params.id;
    console.log("request del parametro ID en Proyecto " , idProject);
    
    Project.find({ _id: idProject}, function(err, pro){
        console.log("buscando en la BD");
        if(err){
            return response.status(400).send(err)
        }
        return response.status(200).send(pro);
    })

}); 

//delete a poll
/*
router.post('/polls', authenticate, function(request, response){
    console.log("ENTRO A BORRAR POLL");
    console.log("el request es ", request.body);
    var pollToDeleteId = request.body._id;
    console.log("el id del que quieres borrar es: " + pollToDeleteId);
    Poll.remove({ _id: pollToDeleteId}, function(err, pol){
        console.log("BORRANDO DE LA BD");
        if(err){
            return response.status(400).send(err)
        }
        return response.status(200).send(pol);
    })

}); */


//Get all the polls

router.get('/projects',  function(request, response){
    console.log("ENTRO AL GET DE PROJECTS");
    //console.log("con esta respuesta ", response.req.headers);
   
    Project.find({}, function(err, projects){
        if(err){
            return response.status(400).send(err)
        }
        if(projects.length < 1){
            return response.status(400).send('No projects added yet')
        }
        return response.status(200).send(projects)
    }) 
}); 

//CReate a new poll
router.post('/projects', function(request, response){
    console.log("ENTRO A CREAR NEW PROJECTO");
    console.log("el request body de create a new project ", request.body);

    if(request.body.borrar){
        console.log("se va a borrar el proyecto: ");
        var projectIdToDelete = request.body._id;
        var projectToDelete = {"estado" : request.body.estado,
        "notas": request.body.notas,
        "rfi": request.body.rfi,
        "descripcion": request.body.descripcion,
        "nombre": request.body.nombre,
        "actividades": request.body.actividades,
                            };
        console.log("se borrara : ", projectToDelete);

        Project.remove({ _id: projectIdToDelete}, function(err, pol){
            console.log("BORRANDO DE LA BD");
            if(err){
                return response.status(400).send(err)
            }
            return response.status(200).send(pol);
        })

    }
    
    if(request.body.cambiar){
        var projectIdToUpdate = request.body._id;
        var projectToUpdate = {"estado" : request.body.estado,
        "notas": request.body.notas,
        "rfi": request.body.rfi,
        "descripcion": request.body.descripcion,
        "nombre": request.body.nombre,
        "actividades": request.body.actividades,
                            };
        console.log("se cambiara a: ", projectToUpdate);
        /*
        Project.update({ _id: projectIdToUpdate},{ $set: {rfi : projectToUpdate}}, function(err, response){
            console.log("actualizando en bd");
            if(err){
                return response.status(400).send(err)
                //console.log("error en acualizar en BD")
            }
            console.log("response en actualizacion de bd ", response);
        }) */
        
        Project.updateOne({ _id: projectIdToUpdate}, projectToUpdate, function(err, response) {
            console.log("actualizando en bd");
            if(err){
                return response.status(400).send(err)
                //console.log("error en acualizar en BD")
            }
            console.log("response en actualizacion de bd ", response);
          });

    }if(request.body.crear){
        console.log("se creara un proyecto");
        var project = new Project();
        project.nombre = request.body.nombre;
        project.descripcion = request.body.descripcion;
        project.rfi = request.body.rfi;
        project.notas = request.body.notas;
        project.estado = request.body.estado;
        project.actividades = request.body.actividades;
        /*
        var actividadesFormat=[];
        for(var f=0; f < project.actividades.length; f++){
            var fechaFormat = project.actividades[f].fecha;
            var dateString = new Date(fechaFormat).toUTCString().split(' ').slice(0, 4).join(' ');
            actividadesFormat[f] = dateString;
            project.actividades[f].fecha = actividadesFormat[f];
            console.log("fecha en string " , dateString);
        }
        console.log("las actividades en nuevo formato: ", actividadesFormat); 
        //project.actividades = actividadesFormat;
        console.log("se creo el proyecto: " + project); */
    
       
        project.save(function(err, res){
            console.log("a punto de guardar proyecto, la respuesta es ", res);
            if(err){
                console.log("error al guardar en BD");
                return response.status(400).send(err)
            }
            return response.status(201).send(res)
        });
    }
    
    
});








module.exports = router;