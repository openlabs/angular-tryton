#!/bin/sh

if [ $(git diff --cached --name-status | grep "src/tryton.js" -c) -ne 0 ]
then
  echo "Minifying tryton.js"
  grunt uglify
  git add src/tryton.min.js
fi
