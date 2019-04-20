const express = require('express');
const app = express();


const port = process.env.PORT || 8084;

const MongoClient = require('mongodb').MongoClient;

const url = process.env.theMongo || process.env.MONGODB_URI;
const bcrypt = require('bcrypt');

const multer = require('multer');

const storage = multer.diskStorage({
    destination:'./public/uploads',
    filename:function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() +
        path.extname(file.originalname))
    }
});

const upload = multer({
    storage:storage
}).single('myImage');

const serveStatic = require('serve-static');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

const cookieParser = require('cookie-parser');
app.use(cookieParser())

const path = require('path');

app.use(serveStatic(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));


app.get('/favicon.ico', (req, res) => {
    res.end('favicon')
})

app.get('/astroLanding', (req, res) => {
    res.render('astroLanding');
})

app.get('/home', (req, res) => {
    res.render('home');
})

app.get('/astrology', (req, res) => {
    res.render('astrology');
})

app.get('/astroWorld', (req, res) => {
    res.render('astroWorld');
})

app.get('/editProfile', (req, res) => {
    res.render('editProfile');
})

app.post('/upload', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            res.send(err)
        } else {
            MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
                if (err) throw err;
                var dbo = db.db("astroWorld");
                dbo.collection('people').updateOne({'username':`${req.cookies.accountName}`}, {$set: {'picture':`${req.file.filename}`}}, (err, r) => {
                    res.render('editProfile');
                })
            });
        }
    })
})

app.post('/signUp', (req, res) => {
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("astroWorld");
        bcrypt.hash(req.body.password, 5, function(err, hash) {
            dbo.collection("people").insertOne({
                username:req.body.username,
                birth:req.body.birthday,
                pass:hash,
                tropical:req.body.tropical,
                chinese:req.body.chinese,
                element:req.body.element,
                picture:req.body.picture

            });
        });
        res.redirect('/')
      });
});

app.post('/logIn', (req, res) => {
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("astroWorld");
        dbo.collection("people").find({"username":`${req.body.username}`}).toArray((err, data) => {
            bcrypt.compare(req.body.password, data[0].pass, function(err, result) {
                if (result) {
                    res.render('astroLanding', {data:data});
                } else {
                    res.redirect('/');
                }
            });
        });
    });
});

app.get('/info', (req, res) => {
    res.render('astrologyInfo');
});

app.get('/search', (req, res) => {
    res.render('search');
});

app.get('/searching', (req, res) => {
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("astroWorld");
        dbo.collection("people").find({$and:[{'tropical':`${req.query.tropical}`}, {'chinese':`${req.query.chinese}`}]}).toArray((err, data) => {
            if (err) throw err;
            res.render('searching', {data})
        });
    });
});

app.get('/profile', (req, res) => {
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("astroWorld");
        dbo.collection("people").find({'username':`${req.cookies.theUsersName}`}).toArray((err, data) => {
            res.render('profile', {data})
        });
    });
});

app.post('/sendMessage', (req, res) => {
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("astroWorld");
        dbo.collection("messages").insertOne({
            sender:req.body.sender,
            receiver:req.body.receiver,
            message:req.body.message
        });
    });
    res.redirect('/profile');
});

app.get('/messages', (req, res) => {
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("astroWorld");
        dbo.collection("messages").find({'receiver':`${req.cookies.accountName}`}).toArray((err, data) => {
            res.render('messages', {data})
        });
    });
});

app.get('/messagesFrom', (req, res) => {
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("astroWorld");
        dbo.collection("messages").find({
            '$or':[
                {'$and':[{'sender':`${req.cookies.theSender}`},{'receiver':`${req.cookies.accountName}`}]},
                {'$and':[{'receiver':`${req.cookies.theSender}`},{'sender':`${req.cookies.accountName}`}]},
            ]}).toArray((err, data) => {
            res.render('messagesFrom', {data});
        });
    });
});

app.post('/reply', (req, res) => {
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("astroWorld");
        dbo.collection("messages").insertOne({
            sender:req.cookies.accountName,
            receiver:req.cookies.theSender,
            message:req.body.message
        });
    });
    res.redirect('/messagesFrom');
});

app.get('/profiler', (req, res) => {
    res.render('profile')
})

app.post('/updateTest', (req, res) => {
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("astroWorld");
        dbo.collection('people').updateOne({'username':`${req.cookies.accountName}`}, {$set: {'picture':'shit'}}, (err, r) => {
            res.end('bingo bitch');
        });
    });
});

app.post('/addMetaData', (req, res) => {
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("astroWorld");
        dbo.collection('people').updateOne({'username':`${req.cookies.accountName}`}, {$set: {'meta':req.body.meta}}, (err, r) => {
            res.render('editProfile');
        });
    });
});

app.post('/sendAMessage', (req, res) => {
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("astroWorld");
        dbo.collection("messages").insertOne({
            sender:req.cookies.accountName,
            receiver:req.body.receiver,
            message:req.body.message
        });
    });
    res.redirect('/search');
})




app.listen(port);
