var http = require('http')
  , util = require('util')
  , mysqlClient = require('mysql').Client;

var server = http.createServer(function (req, res) {
//  console.log('received req');
//  console.log(util.inspect(req));

  req.socket.setNoDelay(true);

  req.socket.on('error', function (err) {
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
    dbClient.connect(function (err) {
      if (err) {
        console.log('DB connect error: (' + err.number + ') ' + err.message);
//        console.log(util.inspect(err));
      }

      dbClient.query(
        "SELECT SLEEP(?) AS LEEP, ? AS morning_after;",
        [0.666, 'Rise and shine!'],
        function (err, results, fields) {
          if (err) {
            console.log('DB read error: (' + err.number + ') ' + err.message);
//            console.log(util.inspect(err));
          }
  
          res.write(util.inspect(results) + '\n');
          
          dbClient.end();
          res.end('world!\n');
        }
      );

    });
  } catch (err) {
    console.log('DB connect catched error: (' + err.errno + ') ' + err.message);
  }

});

server.listen(8567);
console.log('HTTP server listens on port 8567.');
