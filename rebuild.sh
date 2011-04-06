#!/bin/bash

rm -rf node_modules
mkdir -p node_modules
cd node_modules
git clone https://github.com/felixge/node-mysql.git mysql
cd mysql
git checkout 0790eba1a8caf90385bc5ec52f2b9a438f270e80
