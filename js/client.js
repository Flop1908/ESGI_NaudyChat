		$('#users').fadeOut();
		$('#messages').fadeOut();
(function($){
	var socket = io.connect('http://localhost:1337');
	var msgtpl = $('#msgtpl').html();
	var lastmsg=false;
	$('#msgtpl').remove();
	

	$('#loginform').submit(function(event){
		event.preventDefault();
		socket.emit('login',{
			username : $('#usename').val(),
			mail	 : $('#mail').val()
		})
	})

	socket.on('logged',function(){
		$('#users').fadeIn();
		$('#messages').fadeIn();
		$('#login').fadeOut();
		$('#message').focus();
	});
	//envoi de message
	$('form').submit(function(event){
		event.preventDefault();
		socket.emit('newmsg',{message: $('#message').val()});
		$('#message').val('');
		$('#message').focus();
	})

	socket.on('newmsg',function(message){
		if(lastmsg!= message.user.id){
			$('messages').append('div class="sep"></div>');
			lastmsg = message.user.id;
		}
		$('#messages').append('<div class="message">' + Mustache.render(msgtpl,message) +'</div>');
		$('message').animates({scrollTop: $('message').prop('scrollHeight')},500)
	});
	/**
	*Gestion de connection 
	**/
	socket.on('newusr',function(user){
		$('#users').append('<img src="' + user.avatar + '" id="' + user.id + '">');
	})
	socket.on('disusr',function(user){
		$('#' + user.id).remove();
	})
})(jQuery);