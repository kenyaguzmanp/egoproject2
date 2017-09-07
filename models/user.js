var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    }
});

// UserSchema.pre('save', function(next){
//     console.log('saving the user');
//     next()
// });

// UserSchema.post('save', function(next){
//     console.log('user saved');
//     next()
// });

var Model = mongoose.model('User', UserSchema);

module.exports = Model;