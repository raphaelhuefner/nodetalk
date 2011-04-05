var http = require('http')
  , util = require('util')
  , mysqlClient = require('mysql').Client;

http.createServer(function (req, res) {
  res.writeHead(200, {'content-type': 'text/plain'});
  res.write('hello\n');

  var dbClient = new mysqlClient({
//    host: '127.0.0.1'
//    host: 'localhost'
//    , port: 3306
    user: 'dev'
    , password: 'dev'
  });
  
  dbClient.connect(function (err) {
    if (err) {
      throw err;
    }

    console.log(util.inspect(dbClient));
/*
    dbClient.query(
      "SELECT SLEEP(?) AS LEEP, ? AS greeting;"
      , 
      [
        0.666
        , 'Rise and shine!'
      ]
      , 
      function (err, results, fields) {
        if (err) {
          throw err;
        }

        console.log(results);
        console.log(fields);
        
        dbClient.end();
      }
    );
*/
  });

  res.end('world!\n');
}).listen(8567);
