#!/bin/bash
# see stackoverflow.com/questions/12320220

TMPDIR=$(mktemp -d)
TREE=$(git write-tree)
git archive $TREE | tar -x -C $TMPDIR

# Run tests
cp .env "$TMPDIR" && cp -ar node_modules/ "$TMPDIR" && cd "$TMPDIR" && npm run lint-nofix

RESULT=$?
rm -rf "$TMPDIR"
exit $RESULT