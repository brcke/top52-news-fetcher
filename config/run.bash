#!/bin/bash

while [[ "$#" > 0 ]]; do case $1 in
  -d|--port) port="$2"; shift;;
  *) echo "Unknown parameter passed: $1"; exit 1;;
esac; shift; done

gulp scripts && PORT=$port node dist/index.js 