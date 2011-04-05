#!/bin/bash
ulimit -S -n $(sysctl -n kern.maxfilesperproc)
node mysql.js
