var express = require('express')
  , util = require('util')
  , io = require('./node_modules/socket.io');

var app = express.createServer();

app.configure(function () {
    app.use(express.static(__dirname + '/public'));
//    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.get('/', function(req, res){
  res.send('<h1>Welcome. Try the <a href="/stat.html">stat</a> example.</h1>');
});

app.listen(3000);

// socket.io 
var websocket = io.listen(app, {flashPolicyServer:false}); 

var buffer = ['hi there'];

websocket.on('connection', function (client) { 
  client.send({ buffer: buffer });
  client.on('message', function () { console.log('websocket client message') }) 
  client.on('disconnect', function () { console.log('websocket client disconnect') }) 
}); 
/*
websocket.on('connection', function (client) {
  client.send({ buffer: buffer });
  client.broadcast({ announcement: client.sessionId + ' connected' });
  
  client.on('message', function(message){
    var msg = { message: [client.sessionId, message] };
    buffer.push(msg);
    if (buffer.length > 15) buffer.shift();
    client.broadcast(msg);
  });

  client.on('disconnect', function(){
    client.broadcast({ announcement: client.sessionId + ' disconnected' });
  });
});
*/
