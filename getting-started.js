var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

var db = mongoose.connection;
exports.connect = db;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
	console.log('Success')
});


var waterSchema = new mongoose.Schema({
	time: Date,
	weight: Number
});
var Water = mongoose.model('Water', waterSchema)
exports.Water = Water;

