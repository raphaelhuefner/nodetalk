var express = require('express')
  , _ = require('./node_modules/underscore')._
  , util = require('util')
  , os = require('os')
  , mysqlClient = require('mysql').Client
  , exec = require('child_process').exec
  , spawn = require('child_process').spawn
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

websocket.on('connection', function (client) { 
  client.on('message', function () { console.log('websocket client message') }) 
  client.on('disconnect', function () { console.log('websocket client disconnect') }) 
}); 

var queue = [];
function enQueueData(prefix, leaves) {
  queue.push({
    prefix: prefix
    , time: Date.now()
    , leaves: leaves
  });
}

function sendDataPackage() {
  if (0 < queue.length) {
    websocket.broadcast({queue:queue, servertime:Date.now()});
    queue = [];
//    console.log('send ' + Date.now());
  }
}

setInterval(sendDataPackage, 50);

function netstat(prefix, localPortRegExp) {
  var valid = true;
  var wholestring = '';
  var output = {};
  var netstatChildProcess = spawn('netstat', ['--inet', '-anW']); // Linux
//  var netstatChildProcess = spawn('netstat', ['-f', 'inet', '-an']); // Mac OSX
  netstatChildProcess.stdin.end();
  netstatChildProcess.stderr.on('data', function(data) {
//    console.log('stderr: ' + data);
    valid = false;
  });
  netstatChildProcess.stdout.setEncoding('utf8');

  netstatChildProcess.stdout.on('data', function (data) {
    wholestring += data; // deal with partial lines by buffering the whole output
  })

  netstatChildProcess.on('exit', function (code) {
    var lines = wholestring.split(/\n/);
    for (i = 0; i < lines.length; i++) {
      var fields = lines[i].trim().split(/\s+/);

      // gawk '$4 == "127.0.0.1:8567" && $6 != "LISTEN" {sum[$6]++}; END {for (i in sum) print i, sum[i]}'
      if (fields[5] && fields[3] && (localPortRegExp.test(fields[3]))) {
        if (output[fields[5]]) {
          output[fields[5]] += 1;
        }
        else {
          output[fields[5]] = 1;
        }
      }
    }

//    console.log('child process exited with code ' + code);
//    console.log(util.inspect(output));
    if (! _.isEmpty(output)) {
      enQueueData(prefix, output);
    }
    setTimeout(function () { netstat(prefix, localPortRegExp)}, 200);
  });
}


function systemLoad() {
  var avg = os.loadavg();
  enQueueData('loadAvg', {
    '1min' : avg[0]
    , '5min' : avg[1]
    , '15min' : avg[2]
  });
  setTimeout(systemLoad, 1000);
}

var dbClient = new mysqlClient({
  host: '127.0.0.1'
  , port: 3306 // try 8889 with MAMP
//  , port: 8889
  , user: 'dev'
  , password: 'dev'
});

process.on('exit', function () {
  dbClient.end();
});

dbClient.connect(function dbConnectHandler (err) {
  if (err) {
    console.log('DB connect error: (' + err.number + ') ' + err.message);
    process.exit(1);
  }
});

function mySqlProcessCount() {

  dbClient.query(
    "SHOW PROCESSLIST;",
    function dbResultHandler (err, results, fields) {
      if (err) {
        console.log('DB read error: (' + err.number + ') ' + err.message);
      }
      else {
        enQueueData('MySQL', {
          'ProcessCount' : results.length
        });
        setTimeout(mySqlProcessCount, 100);
      }
    }
  );

}


netstat('node-netstat', /127\.0\.0\.1.8567/);
netstat('apache-netstat', /127\.0\.0\.1.8004/);


systemLoad();
mySqlProcessCount();
