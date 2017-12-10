#!/bin/bash
# see stackoverflow.com/questions/12320220

TMPDIR=$(mktemp -d)
TREE=$(git write-tree)
git archive $TREE | tar -x -C $TMPDIR

# Run tests
cp .env "$TMPDIR" && cd "$TMPDIR" && npm install && npm run lint-nofix && npm run test

RESULT=$?
rm -rf "$TMPDIR"
exit $RESULT