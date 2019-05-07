#!/bin/bash

if [ -z $2 ]; then
    ava --verbose 'src/modules/'$1'/test/*.js';
else
    ava --verbose 'src/modules/'$1'/test/'$2'.js';
fi