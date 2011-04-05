var http = require('http')
  , util = require('util')
  , mysqlClient = require('mysql').Client;

http.createServer(function (req, res) {
  res.writeHead(200, {'content-type': 'text/plain'});
  res.write('hello\n');

  var dbClient = new mysqlClient({
    host: '127.0.0.1'
    , port: 8889 // crazy MAMP idiosyncrazy
    , user: 'dev'
    , password: 'dev'
  });
  
  dbClient.connect(function (err) {
    if (err) throw err;
    dbClient.query(
      "SELECT SLEEP(?) AS LEEP, ? AS morning_after;",
      [0.666, 'Rise and shine!'],
      function (err, results, fields) {
        if (err) throw err;

        res.write(util.inspect(results) + '\n');
        
        dbClient.end();
        res.end('world!\n');
      }
    );
  });
}).listen(8567);
