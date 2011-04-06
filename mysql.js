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
        res.end('world!\n');

  try {
    var dbClient = new mysqlClient({
      host: '127.0.0.1'
      , port: 3306 // try 8889 with MAMP
      , user: 'dev'
      , password: 'dev'
    });

    dbClient.connect(function (err) {
      if (err) { console.log('connect problem'); throw err; }
      dbClient.query(
        "SELECT SLEEP(?) AS LEEP, ? AS morning_after;",
        [0.666, 'Rise and shine!'],
        function (err, results, fields) {
          if (err) { console.log('read problem'); throw err; }
  
          res.write(util.inspect(results) + '\n');
          
          dbClient.end();
          res.end('world!\n');
        }
      );
    });
    
  } catch (err) {
    console.log('catched error around mysqlClient instantiation and DB connect');
    console.log(util.inspect(err));
  }
})

server.listen(8567);
console.log('HTTP server listens on port 8567.');
