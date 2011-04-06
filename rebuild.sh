#!/bin/bash

sudo rm set-linux-ulimit
gcc set-linux-ulimit.c -o set-linux-ulimit
chmod o-rwx set-linux-ulimit
chmod g-w set-linux-ulimit
sudo chown root set-linux-ulimit
sudo chmod u+s set-linux-ulimit

rm -rf node_modules
mkdir -p node_modules
cd node_modules

git clone git://github.com/LearnBoost/Socket.IO-node.git socket.io
cd socket.io/
git checkout 0.6.17
cd -

git clone https://github.com/senchalabs/connect.git
git clone https://github.com/visionmedia/express.git

git clone https://github.com/felixge/node-mysql.git mysql
cd mysql
git checkout 0790eba1a8caf90385bc5ec52f2b9a438f270e80
