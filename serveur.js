var http = require('http');
var md5 = require('md5');


httpServer = http.createServer(function(req,res){
	console.log('test 1');
});

httpServer.listen(1337);

var io = require('socket.io').listen(httpServer);
var users = {};
var messages = [];
var history = 2;
io.sockets.on('connection',function(socket){ 
	
	var me = false
	console.log('nouveau user');
	
	//liste des utilisateurs connecté à envoyer au nouveau user
	for(var k in users){
		socket.emit('newusr',users[k]);
	}
	
	for(var k in messages){
		socket.emit('newmsg',messages[k]);
	}
	
	/**
	* Message reçus
	**/
	socket.on('newmsg',function(message){
		message.user = me;
		date = new Date();
		message.h = date.getHours();
		message.m = date.getMinutes();
		messages.push(message);
		if(message.length > history){
			message.shift();
		}
		io.sockets.emit('newmsg',message);
	});
	
	/**
	* Gestion de la soket = connexion
	**/
	socket.on('login',function(user){ 
		me = user;
		me.id = user.mail.replace('@','-').replace('.','-');
		me.avatar = 'https://gravatar.com/avatar/'+md5(user.mail)+'?s=50';
		socket.emit('logged');
		users[me.id] = me;
		io.sockets.emit('newusr',me);
	});
	
	/**
	* Deconnexion
	**/
	socket.on('disconnect',function(){
		if(!me){
			return false;
		}
		delete users[me.id];
		io.sockets.emit('disusr',me);
	});
	
});