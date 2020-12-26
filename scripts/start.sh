#!/bin/sh

check_preflight="$(node scripts/pre-flight.js)"


check_run() {
  node scripts/pre-flight.js
  result=$?

  if [ $result -eq 0 ]
  then eval "$1"
  else
    echo "Preflight checks failed"
    exit 1
  fi
}

check_run "rm -rf ./build && razzle start"