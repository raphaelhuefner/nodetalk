<?php

header('content-type: text/plain', TRUE, 200);
echo "hello\n";

try {
  $db = new PDO('mysql:host=127.0.0.1;port=8889', 'dev', 'dev');
} catch (Exception $err) {
  echo 'connect problem';
  throw $err;
}

try {
  $dbStatement = $db->prepare("SELECT SLEEP(?) AS LEEP, ? AS morning_after;");
  $dbStatement->execute(array(0.666, 'Rise and shine!'));
  $results = $dbStatement->fetchAll(PDO::FETCH_ASSOC);
} catch (Exception $err) {
  echo 'connect problem';
  throw $err;
}

echo json_encode($results) . "\n";

echo "world!\n";

//var_dump(posix_getrlimit());
