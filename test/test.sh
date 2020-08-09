#!/bin/bash

if [ -z $2 ]; then
    if [ -z $1 ]; then
        nyc ava --timeout=2m
    else
        ava --timeout=2m ./src/modules/$1/test/*.js
    fi
else
    ava ./src/modules/$1/test/$2.js
fi
