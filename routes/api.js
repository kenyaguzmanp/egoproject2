var express = require('express');
var router = express.Router({ caseSensitive: true });
var bcrypt = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');
var User = require('../models/user');
var Poll = require('../models/polls');


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
    

});



router.get('/polls/:id', function(request, response){
    console.log("ENTRO A POLL");
    //console.log("request del poll en get REMOTE ADDRESS", request.connection.remoteAddress);
    var idPoll = request.params.id;
    //console.log("request del parametro ID en Poll " , idPoll);

    Poll.find({ _id: idPoll}, function(err, pol){
        console.log("buscando en la BD");
        if(err){
            return response.status(400).send(err)
        }
        return response.status(200).send(pol);
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
router.get('/polls', authenticate, function(request, response){
    console.log("ENTRO A POLLS");
    //console.log("con esta respuesta ", response.req.headers);
    if(response.req.headers.authorization){
        console.log("autorizado");
    }
   
    Poll.find({}, function(err, polls){
        if(err){
            return response.status(400).send(err)
        }
        if(polls.length < 1){
            return response.status(400).send('No polls added yet')
        }
        return response.status(200).send(polls)
    }) 
});

//CReate a new poll
router.post('/polls', authenticate, function(request, response){
    console.log("ENTRO A CREAR NEW POLL");
    //console.log("el request body de create a new poll ", request.body);
    if(!request.body.options || !request.body.name){
        return response.status(400).send('No poll data supplied');
    }
    if(!request.body.toDelete){
        var poll = new Poll();
        poll.name = request.body.name;
        poll.options = request.body.options;
     //var token = request.headers.authorization.split(' ')[1];
     //console.log("el supuesto token: " , request.headers.authorization.split(' ')[1] );
       // poll.user = request.body._id;
        poll.user = request.body.user;
       // console.log("se creo el poll con este uduario id: " + poll.user);

        poll.save(function(err, res){
            if(err){
                return response.status(400).send(err)
            }
            return response.status(201).send(res)
        });
    }else{
        console.log("se borrara");
        var pollToDeleteId = request.body._id;
       // console.log("el id del que quieres borrar es: " + pollToDeleteId);
        Poll.remove({ _id: pollToDeleteId}, function(err, pol){
            console.log("BORRANDO DE LA BD");
            if(err){
                return response.status(400).send(err)
            }
            return response.status(200).send(pol);
        })
    }
    
});


//verification of token
router.post('/verify', function(request, response){
   // console.log("el token en verify: ", request.body.token);
    if(!request.body.token){
        return response.status(400).send('No token has been provided');
    }
    jwt.verify(request.body.token, process.env.secret, function(err, decoded){
        if(err){
            return response.status(400).send('error with token')
        }
        return response.status(200).send(decoded)
    });
});

//login
router.post('/login', function(request, response){
    if(request.body.name && request.body.password){
        User.findOne({ name: request.body.name }, function(err, user){
            if(err){
                return response.status(400).send('An error has ocurred. lease try again.');
            }
            if(!user){
                return response.status(404).send('No user registered with that credentials');
            }
            if(bcrypt.compareSync(request.body.password, user.password)){
                var token = jwt.sign({
                    data: user
                }, process.env.secret, { expiresIn: 3600})
                return response.status(200).send(token);
            }
            return response.status(400).send('Invalid password');
        })
    }else{
        return response.status(400).send('Please enter valid credentials');
    }
});

//register

router.post('/register', function(request, response){
    if(request.body.name && request.body.password){
        var user = new User();
        user.name = request.body.name;
        user.password = bcrypt.hashSync(request.body.password, bcrypt.genSaltSync(10));
        user.save(function(err, document){
            if(err){
                return response.status(400).send(err)
            }else{
                var token = jwt.sign({
                    data: document
                }, process.env.secret, { expiresIn: 3600});
                return response.status(201).send(token);
            }
        });
    }else{
        return response.status(400).send({
            message: 'Invalid credentials supplied'
        })
    }
});

//Authentication middleware
function authenticate(request, response, next){
    if(!request.headers.authorization){
        return response.status(404).send('No token supplied')
    }
    if(request.headers.authorization.split(' ')[1]){
        var token = request.headers.authorization.split(' ')[1];
        jwt.verify(token, process.env.secret, function(err, decoded){
            if(err){
                return response.status(400).send(err)
            }
            console.log("continuig with middleware");
            next();
        })
    }
};


module.exports = router;