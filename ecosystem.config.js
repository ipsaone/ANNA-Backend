module.exports = {
  apps : [{
    name: 'Backend Production API',
    script: './src/app.js',

    // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
    instances: 2,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }, {
    name: 'Backend Staging API',
    script: './src/app.js',

    // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
    instances: 2,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'staging'
    }
  }],

  deploy : {
    staging : {
      user : 'travis',
      host : 'ipsaone.space',
      ref  : 'origin/staging',
      repo : 'git@github.com:ipsaone/ANNA-Backend.git',
      path : '/home/travis/ANNA-Backend-staging',
      ssh_options: "StrictHostKeyChecking=no",
      "pre-setup": `
        openssl aes-256-cbc -K $encrypted_f57c64a0b291_key -iv $encrypted_f57c64a0b291_iv
        in ./travis_deploy_key.enc -out ~/travis_deploy_key -d
        eval "$(ssh-agent -s)"
        chmod 600 ~/travis_deploy_key
        echo -e "Host ipsaone.space\n\tStrictHostKeyChecking no\n" >> ~/.ssh/config
        ssh-add ~/travis_deploy_key
        ssh -i ~/travis_deploy_key travis@ipsaone.space pwd`,
      "post-deploy": "cp ~/.env ./ && npm install && npm run migrate && npm run test && pm2 startOrRestart ecosystem.config.js --env staging"
    },
    production : {
      user : 'travis',
      host : 'ipsaone.space',
      ref  : 'origin/master',
      repo : 'git@github.com:ipsaone/ANNA-Backend.git',
      path : '/home/travis/ANNA-Backend-master',
      "ssh_options": "StrictHostKeyChecking=no",
      "pre-setup": `
        openssl aes-256-cbc -K $encrypted_f57c64a0b291_key -iv $encrypted_f57c64a0b291_iv
        in ./travis_deploy_key.enc -out ~/travis_deploy_key -d
        eval "$(ssh-agent -s)"
        chmod 600 ~/travis_deploy_key
        echo -e "Host ipsaone.space\n\tStrictHostKeyChecking no\n" >> ~/.ssh/config
        ssh-add ~/travis_deploy_key
        ssh -i ~/travis_deploy_key travis@ipsaone.space pwd`,
      "post-deploy": "cp ~/.env ./ && npm install && npm run migrate && npm run test && pm2 startOrRestart ecosystem.config.js --env production"
    }
  }
};
