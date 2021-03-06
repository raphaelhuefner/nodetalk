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

function parse_size(size) {
  var suffixes = {
    '1': 1
    , 'k': 1024
    , 'm': 1048576 // 1024 * 1024
    , 'g': 1073741824 // 1024 * 1024 * 1024
  };
  var result = /([0-9]+)\s*(k|m|g)?(b?(ytes?)?)/i.exec(size);
  if (null !== result) {
    var suffix = '1';
    if (! result[2] || ('' == suffix)) {
      suffix = '1';
    }
    else {
      suffix = result[2].toLowerCase();
    }
    return parseFloat(result[1]) * suffixes[suffix];
  }
}

function proclist(prefix, procGrepRegExp) {
  var wholestring = '';
  var num = {};
  var cpu = {};
  var pmem = {};
  var amem = {};
  var psChildProcess = spawn('ps', ['-A', '-opcpu,pmem,rss,comm']); // Linux
  psChildProcess.stdin.end();
  psChildProcess.stderr.on('data', function(data) {
//    console.log('stderr: ' + data);
  });
  psChildProcess.stdout.setEncoding('utf8');

  psChildProcess.stdout.on('data', function (data) {
    wholestring += data; // deal with partial lines by buffering the whole output
  })

  psChildProcess.on('exit', function (code) {
    var lines = wholestring.split(/\n/);
    for (i = 0; i < lines.length; i++) {
      var line = lines[i];
      var grepResult = procGrepRegExp.exec(line);
      var fields = line.trim().split(/\s+/);
      if ((null !== grepResult) && fields[1] && fields[2] && fields[3]) {
        procName = grepResult[0];

        if (num[procName]) {
          num[procName] += 1;
        }
        else {
          num[procName] = 1;
        }

        if (cpu[procName]) {
          cpu[procName] += parseFloat(fields[0]);
        }
        else {
          cpu[procName] = parseFloat(fields[0]);
        }

        if (pmem[procName]) {
          pmem[procName] += parseFloat(fields[1]);
        }
        else {
          pmem[procName] = parseFloat(fields[1]);
        }

        if (amem[procName]) {
          amem[procName] += parse_size(fields[2]);
        }
        else {
          amem[procName] = parse_size(fields[2]);
        }

      }
    }

//    console.log('child process exited with code ' + code);
//    console.log(util.inspect(output));
    if (! _.isEmpty(num)) {
      enQueueData(prefix + '-num', num);
    }
    if (! _.isEmpty(cpu)) {
      enQueueData(prefix + '-cpu', cpu);
    }
    if (! _.isEmpty(pmem)) {
      enQueueData(prefix + '-pmem', pmem);
    }
    if (! _.isEmpty(amem)) {
      enQueueData(prefix + '-amem', amem);
    }
    setTimeout(function () { proclist(prefix, procGrepRegExp)}, 200);
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
//    process.exit(1);
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
//proclist('proc', /apache2|node|mysql|php-cgi|nginx/);
proclist('proc', /apache2|node|mysql/);

systemLoad();
mySqlProcessCount();
