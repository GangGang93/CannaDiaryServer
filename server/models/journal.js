const mongoose = require('mongoose');

const journalSchema = mongoose.Schema({
    journal_entry:{
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

const Journal = mongoose.model('Journal',journalSchema)

module.exports = { Journal }