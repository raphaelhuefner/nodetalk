var http = require('http')
  , util = require('util')
  , mysqlClient = require('mysql').Client;

var server = http.createServer(function requestHandler (req, res) {
//  console.log('received req');
//  console.log(util.inspect(req));

  req.socket.setNoDelay(true);
  req.socket.setKeepAlive(true);

  req.socket.on('error', function socketErrorHandler (err) {
    console.log('socket error: (' + err.errno + ') ' + err.message);
//    console.log(util.inspect(err));
  });

  res.writeHead(200, {'content-type': 'text/plain'});
  res.write('hello\n');

  var dbClient = new mysqlClient({
    host: '127.0.0.1'
    , port: 3306 // try 8889 with MAMP
    , user: 'dev'
    , password: 'dev'
  });

  try {
    dbClient.connect(function dbConnectHandler (err) {
      if (err) {
        console.log('DB connect error: (' + err.number + ') ' + err.message);
//        console.log(util.inspect(err));
        res.end('error!\n');
      }
      else {
        dbClient.query(
          "SELECT SLEEP(?) AS LEEP, ? AS morning_after;",
          [0.666, 'Rise and shine!'],
          function dbResultHandler (err, results, fields) {
            if (err) {
              console.log('DB read error: (' + err.number + ') ' + err.message);
//              console.log(util.inspect(err));
            }
            else {
              res.write(util.inspect(results) + '\n');
            }
            dbClient.end();
            res.end('world!\n');
          }
        );
      }
    });
  } catch (err) {
    console.log('DB connect catched error: (' + err.errno + ') ' + err.message);
    res.end('error!\n');
  }

});

server.on('clientError', function clientConnectionErrorHandler (err) {
  console.log('forwarded client connection error: (' + err.errno + ') ' + err.message);
  console.log(util.inspect(err));
});

server.on('connection', function connectionHandler (connectionStream) {
  connectionStream.on('error', function connectionErrorHandler (err) {
    console.log('connection error: (' + err.errno + ') ' + err.message);
    console.log(util.inspect(err));
  });
});

process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err);
});

server.listen(8567, '127.0.0.1');
console.log('HTTP server listens on http://127.0.0.1:8567/.');
