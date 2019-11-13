#!/bin/sh
# Run tests, generate documentation & coverage report
npm run test

# Upload documentation & coverage report to github pages
# NOOP

# Compute SHA1, Zip, Upload
#node ./devops/files_sha1.js
#zip
#scp file

# Backup
#ssh -c

# Deploy
#ssh -c node deploy.js