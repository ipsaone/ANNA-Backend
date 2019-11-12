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
      NODE_ENV: 'development'
    },
    env_production: {
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
      NODE_ENV: 'development'
    },
    env_production: {
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
      "ssh_options": "StrictHostKeyChecking=no",
      "post-deploy": "cp ~/.env ./ && npm install && npm run migrate && npm run test && pm2 startOrRestart ecosystem.config.js --env staging"
    },
    production : {
      user : 'travis',
      host : 'ipsaone.space',
      ref  : 'origin/dev',
      repo : 'git@github.com:ipsaone/ANNA-Backend.git',
      path : '/home/travis/ANNA-Backend-master',
      "ssh_options": "StrictHostKeyChecking=no",
      "post-deploy": "cp ~/.env ./ && npm install && npm run migrate && npm run test && pm2 startOrRestart ecosystem.config.js --env production"
    }
  }
};
