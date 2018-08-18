#!/bin/bash

while [[ "$#" > 0 ]]; do case $1 in
  -d|--port) port="$2"; shift;;
  *) gulp scripts && PORT=5000 node dist/index.js exit 1;;
esac; shift; done

gulp scripts && PORT=$port node dist/index.js