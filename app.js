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

/* Static file serving */
app.use(express.compress());
app.use(express.static(__dirname + '/public'));

/* DB and sessions */
var db = require('./models/db.js');
db.configure(app, express);
var connection = db.connection;
connection.on('error', console.error.bind(console, 'Mongoose connection error: '));
connection.once('open', function cb() {
  // Once control flow reaches here, we're connected to the DB
  
  /* Authentication methods */
  var auth = require('./auth/auth.js');
  var passport = auth.configure(app);
  app.post('/login', function(req, res) {
    auth.login(req, res);
  });
  app.post('/signup', function(req, res) {
    auth.signup(req, res);
  });
});

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);
httpServer.listen(80);
httpsServer.listen(443);
