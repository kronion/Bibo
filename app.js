var express = require('express');
var app = express();

app.use(express.static(__dirname + '/public'));

app.post('/login', passport.authenticate('local', 
          { successRedirect: '/users' + req.user.username,
            failureRedirect: '/',
            failureFlash: true }));
});

app.listen(3737);
