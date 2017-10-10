var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProjectsSchema =  new Schema({
    
    rfi: {
        type: Number,
        required: true,
        unique: true       
    }, 
    nombre: {
        type: String,
        required: true
       // unique: true       
    },
    descripcion: {
        type: String,
        required: true
        //unique: true,       
    },
    estado: {
        type: String,
        required: true
        //unique: true,       
    },
    
    notas: {
        type: String,
        required: true
        //unique: true,       
    }

});

var Model = mongoose.model('Projects', ProjectsSchema);

module.exports = Model;