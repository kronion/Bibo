/* File system */
var fs = require('fs');

/* HTTP and HTTPS */
var http = require('http');
var https = require('https');

/* SSL files */
var privateKey = fs.readFileSync('server.key', 'utf8');
var certificate = fs.readFileSync('server.crt', 'utf8');
var pem_key = fs.readFileSync('pem_key', 'utf8');
var credentials = {
  key: privateKey,
  cert: certificate,
  passphrase: pem_key
};

/* Express */
var express = require('express');
var app = express();
app.enable('trust proxy'); // Our VPS is behind a reverse proxy

/* Static file serving */
app.use(express.compress());
app.use(express.static(__dirname + '/public'));

/* Redirect HTTP to HTTPS */
app.use(function (req, res, next) {
  if (req.protocol === 'https') {
    next();
  }
  else {
    var new_url = 'https://' + req.headers.host + req.url;
    res.redirect(new_url);
  }
});

/* HSTS */
app.use(function(req, res, next) {
  res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  return next();
});

/* Jade */
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.locals({
  title: 'Bibo'
});

/* DB and sessions */
var db = require('./models/db.js');
var connection = db.connection;
var Water = db.Water;
connection.on('error', console.error.bind(console, 'Mongoose connection error: '));
connection.once('open', function() {
  // Once control flow reaches here, we're connected to the DB
  db.configure(app, express);

  /* Authentication methods */
  var auth = require('./auth/auth.js');
  var passport = auth.configure(app);
  app.post('/login', auth.login);
  app.get('/logout', auth.logout);
  app.post('/signup', auth.signup);

  /* Home */
  app.get('/user', function(req, res) {
    if (req.user) {
      Water.find({}, function(err, glasses) {
        if (err) {
          console.err.bind(console, "Mongodb error: ");
        }
        else {
          var data = [];
          for (var i = 0; i < glasses.length; i++) {
            data.push([0, glasses[i].mLs-1500+i]);
          }
          res.render('home.jade', { user: req.user,
                                    data: JSON.stringify(data),
                                    firstDate: glasses[0].time.toString(),
                                    lastDate: glasses[glasses.length-1].time.toString() });
        }
      });
    }
    else {
      res.redirect('/');
    }
  });

  /* Electric Imp */
  app.get('/imp', function(req, res) {
    var mLs = req.param('vol');
    console.log(mLs);
    var water = new Water({ time: new Date(),
                            mLs: mLs });
    water.save();
    res.send(200);
  });
});

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);
httpServer.listen(80);
httpsServer.listen(443);
