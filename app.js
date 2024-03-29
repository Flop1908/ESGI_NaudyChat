
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

var users = {};//user list

app.get('/', function (req, res) {
  if (req.cookies.user == null) {
    res.redirect('/signin');
  } else {
    res.sendfile('views/index.html');
  }
});
app.get('/signin', function (req, res) {
  res.sendfile('views/signin.html');
});
app.post('/signin', function (req, res) {
  if (users[req.body.name]) {
    //si exist, interdit de log in
    res.redirect('/signin');
  } else {
    //sinon ajout dans cookie, saute au page index
    res.cookie("user", req.body.name, {maxAge: 1000*60*60*24*30});
    res.redirect('/');
  }
});

var server = http.createServer(app);
var io = require('socket.io').listen(server);
io.sockets.on('connection', function (socket) {

	/*******************************************************************
	*	Gestion des utilisateurs
	**/
	//Connexion 
	socket.on('online', function (data) {
		socket.name = data.user;
		if (!users[data.user]) {
		  users[data.user] = data.user;
		}
		io.sockets.emit('online', {users: users, user: data.user});
	});

	//Deconnexion
	socket.on('disconnect', function() {
		if (users[socket.name]) {
		  delete users[socket.name];
		  socket.broadcast.emit('offline', {users: users, user: socket.name});
		}
	});
	/******************************************************************/
  
	//Gestion des messages
	socket.on('say', function (data) {
		//l'utilisateur s'adresse à tout le monde
		if (data.to == 'all') {
		  socket.broadcast.emit('say', data);
		} 
		//Sinon on cherche la personne
		else 
		{
		  var clients = io.sockets.clients();
		  clients.forEach(function (client) {
			if (client.name == data.to) {
			  client.emit('say', data);
			}
		  });
		}
	});

  
});

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
