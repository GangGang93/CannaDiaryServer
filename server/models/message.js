const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
    message:{
        type:String,
        required:true,
    },
    ownername:{
        type:String,
        required:true,
    },    
    ownerId:{
        type:String,
        required:true,
    }
},{timestamps:true});

const Message = mongoose.model('Message',messageSchema)

module.exports = { Message }