/* Session settings */
var settings = require('./settings.js');

/* Connect to MongoDB */
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/bibo');
var Schema = mongoose.Schema; // Just shortens the code

/* User schema */
var userSchema = Schema({
  username:  String,
  password:  String,
  firstname: String,
  lastname:  String,
  device:    String,
  jawbone:   Boolean,
  fitfit:    Boolean
});
var User = mongoose.model('User', userSchema);

/* Water schema */
var waterSchema = new Schema({
  time: Date,
  weight: Number,
  device: String
});
var Water = mongoose.model('Water', waterSchema);

module.exports = {
  connection: mongoose.connection,
  User: User,
  Water: Water,

  /* Configure sessions */
  configure: function(app, express) {
    var MongoStore = require('connect-mongo')(express);

    app.use(express.cookieParser())
       .use(express.json())
       .use(express.urlencoded());
    app.use(express.session({
      secret: settings.secret,
      key: 'sid',
      cookie: {
        secure: true
      },
      store: new MongoStore({
        db: settings.db
      })
    }));
  }
}
