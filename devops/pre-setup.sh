#!/bin/bash
set -o verbose

echo "Checking branch..."
if [[ "$TRAVIS_BRANCH" != "master" || "$TRAVIS_BRANCH" != "staging" ]]; then
  echo "We're not on the master or staging branch."
  exit -1
fi

echo "Checking variables..."
if [[ -z "$encrypted_f57c64a0b291_key" || -z "$encrypted_f57c64a0b291_iv" ]]; then
  echo "The encrypted variables aren't set."
  exit -1
fi

openssl aes-256-cbc -K $encrypted_f57c64a0b291_key -iv $encrypted_f57c64a0b291_iv in ./travis_deploy_key.enc -out ~/travis_deploy_key -d
eval "$(ssh-agent -s)"
chmod 600 ~/travis_deploy_key
echo -e "Host ipsaone.space\n\tStrictHostKeyChecking no\n" >> ~/.ssh/config
ssh-add ~/travis_deploy_key
ssh -i ~/travis_deploy_key travis@ipsaone.space pwd