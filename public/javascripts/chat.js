$(document).ready(function() {
  $(window).keydown(function (e) {
    if (e.keyCode == 116) {
      if (!confirm("Etes vous sur de vouloir actualiser la page ?")) {
        e.preventDefault();
      }
    }
  });
  
  var socket = io.connect();
  var from = $.cookie('user');
  var to = 'all';
  
  //Connexion au chat
  socket.emit('online', {user: from});
  
  socket.on('online', function (data) {
    //afficher l'information system
    if (data.user != from) {
      var sys = '<div style="color:#f00">system(' + now() + '):' + 'user ' + data.user + ' connect</div>';
    } else {
      var sys = '<div style="color:#f00">system(' + now() + '):you connect</div>';
    }
    $("#contents").append(sys + "<br/>");
    flushUsers(data.users);
    showSayTo();
  });

  socket.on('say', function (data) {
    if (data.to == 'all') {
      $("#contents").append('<div>' + data.from + '(' + now() + ') talk to all：<br/>' + data.msg + '</div><br />');
    }
    if (data.to == from) {
      $("#contents").append('<div style="color:#00f" >' + data.from + '(' + now() + ')talk to you：<br/>' + data.msg + '</div><br />');
    }
  });

  socket.on('offline', function (data) {
    var sys = '<div style="color:#f00">system(' + now() + '):' + 'user ' + data.user + ' disconnect!</div>';
    $("#contents").append(sys + "<br/>");
    flushUsers(data.users);
    if (data.user == to) {
      to = "all";
    }
    showSayTo();
  });

  //disconnect
  socket.on('disconnect', function() {
    var sys = '<div style="color:#f00">System:fail to connect the server</div>';
    $("#contents").append(sys + "<br/>");
    $("#list").empty();
  });

  //reconnect
  socket.on('reconnect', function() {
    var sys = '<div style="color:#f00">System:reconnect to the server</div>';
    $("#contents").append(sys + "<br/>");
    socket.emit('online', {user: from});
  });

  //refresh the user list
  function flushUsers(users) {
    $("#list").empty().append('<li title="doubleClick for chat" alt="all" class="sayingto" onselectstart="return false">all</li>');
    for (var i in users) {
      $("#list").append('<li alt="' + users[i] + '" title="doubleClick for chat" onselectstart="return false">' + users[i] + '</li>');
    }
    $("#list > li").dblclick(function() {

      if ($(this).attr('alt') != from) {

        to = $(this).attr('alt');
      
        $("#list > li").removeClass('sayingto');
   
        $(this).addClass('sayingto');

        showSayTo();
      }
    });
  }


  function showSayTo() {
    $("#from").html(from);
    $("#to").html(to == "all" ? "all" : to);
  }


  function now() {
    var date = new Date();
    var time = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + (date.getMinutes() < 10 ? ('0' + date.getMinutes()) : date.getMinutes()) + ":" + (date.getSeconds() < 10 ? ('0' + date.getSeconds()) : date.getSeconds());
    return time;
  }


  $("#say").click(function() {

    var $msg = $("#input_content").html();
    if ($msg == "") return;
    //ajout le message dans notre dom de navigator
    if (to == "all") {
      $("#contents").append('<div>you(' + now() + ')talk to all：<br/>' + $msg + '</div><br />');
    } else {
      $("#contents").append('<div style="color:#00f" >you(' + now() + ')talk to: ' + to + $msg + '</div><br />');
    }
    //send
    socket.emit('say', {from: from, to: to, msg: $msg});
    $("#input_content").html("").focus();
  });
});
