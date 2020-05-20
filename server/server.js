const express = require('express');
const bodyParser = require('body-parser');
var cors = require('cors');

const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const mongoose = require('mongoose');
const config = require('./config/config').get(process.env.NODE_ENV);
const app = express();


app.use('/uploads',express.static('uploads'));

mongoose.Promise = global.Promise;
mongoose.connect(config.DATABASE, {useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true,});

const { User } = require('./models/user');
const { Journal } = require('./models/journal');
const { Message } = require('./models/message');
const { auth } = require('./middleware/auth');


app.use(bodyParser.json());
app.use(cookieParser());
app.use(fileUpload());
app.use(cors());

app.use(express.static('client/build'));





// GET //
app.get('/api/auth',auth,(req,res)=>{
    res.json({
        isAuth:true,
        id:req.user._id,
        email:req.user.email,
        username:req.user.username,
        password:req.user.password,
        image: req.user.image,
    })
})

app.get('/api/logout',auth,(req,res)=>{
    req.user.deleteToken(req.token,(err,user)=>{
        if(err) return res.status(400).send(err);
        res.sendStatus(200);
    })

})



app.get('/api/getReviewer',(req,res)=>{
    let id = req.query.id;

    User.findById(id,(err,doc)=>{
        if(err) return res.status(400).send(err);
        res.json({
            username:doc.username            
        })
    })
})

app.get('/api/reciver_name',(req,res)=>{
    User.findOne({_id: req.query.id}, {_id: 0, email: 0, password: 0, image: 0}).exec((err,docs)=>{
        if(err) return res.status(400).send(err);            
        res.send(docs)       
    })
})


// POST //

app.post('/api/upload', (req, res) => {
    if(req.files === null){
        return res.status(400).json({ msg: 'No file uploaded'});
    }

    const file = req.files.file;

    var fileExtension = '.' + file.name.split('.').pop();

    file.name = Math.random().toString(36).substring(7) + new Date().getTime() + fileExtension;



    file.mv(`./client/public/uploads/${file.name}`, err => {
        if(err){
            console.error(err);
            return res.status(500).send(err);
        }

        res.json({ fileName: file.name, filePath: `/uploads/${file.name}`});
    });
})

app.post('/api/journal',(req,res)=>{
    const journal = new Journal(req.body);    
    
    journal.save((err,doc)=>{
        if(err) return res.status(400).send(err);
        res.status(200).json({
            ok:true,            
            journalId:doc._id
        })
    })
})
app.post('/api/message',(req,res)=>{
    const message = new Message(req.body);    
    
    message.save((err,doc)=>{
        if(err) return res.status(400).send(err);
        res.status(200).json({
            ok:true,            
            messageId:doc._id
        })
    })
})


app.post('/api/register',(req,res)=>{
    const user = new User(req.body);

    // console.log(user);

    user.save((err,doc)=>{
        if(err) return res.json({success:false});
        res.status(200).json({
            success:true,
            user:doc
        })
    })
}) 

app.post('/api/login',(req,res)=>{
    User.findOne({'email':req.body.email},(err,user)=>{
        if(!user) return res.json({isAuth:false,message:'Auth failed, email not found'});

        user.comparePassword(req.body.password,(err,isMatch)=>{
            if(!isMatch) return res.json({
                isAuth:false,
                message:'wrong password'
            });

            user.generateToken((err,user)=>{
                if(err) return res.status(400).send(err);
                res.cookie('auth',user.token).json({
                    isAuth:true,
                    id:user._id,
                    email:user.email,
                    password:user.password
                })
            })

        })
    })
})


// UPDATE //
app.post('/api/item_update',(req,res)=>{
    Item.findByIdAndUpdate(req.body._id,req.body,{new:true},(err,doc)=>{
        if(err) return res.status(400).send(err);
        res.json({
            success:true,
            doc
        })
    })
})


app.post('/api/user_update',(req,res)=>{

    User.findByIdAndUpdate(req.body._id,req.body,{new:true},(err,doc)=>{
        if(err) return res.status(400).send(err);
        res.json({
            success:true,
            user:doc
        })
    })
    
})

// DELETE //
app.delete('/api/delete_item',(req,res)=>{
    let id = req.query.id;

    Item.findByIdAndRemove(id,(err,doc)=>{
        if(err) return res.status(400).send(err);
        res.json(true)
    })
})


if(process.env.NODE_ENV === 'production'){
    const path = require('path');
    app.get('/*',(req,res)=>{
        res.sendFile(path.resolve(__dirname,'../client','build','index.html'))
    })
}



const port = process.env.PORT || 3001;
app.listen(port, ()=>{
    console.log(`SERVER RUNNING`)
});