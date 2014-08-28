// module dependencies =================================
var express		= require('express');
var port 		= process.env.PORT || 3000;

var app = express();


// app configuration ======================================
app.configure(function(){
	app.use(express.static(__dirname + '/public'));
	app.use(express.bodyParser());
});

// launch ======================================================================
app.listen(port);
console.log('Gravity Quest demo launched on port: ' + port);