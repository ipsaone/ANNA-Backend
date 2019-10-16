module.exports = {
  apps : [{
    name: 'Backend API',
    script: '/src/app.js',

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
  }],

  deploy : {
    production : {
      user : 'travis',
      host : 'ipsaone.space',
      ref  : 'origin/master',
      repo : 'git@github.com:ipsaone/ANNA-Backend.git',
      path : '/home/travis/ANNA-Backend-prod',
      "ssh_options": "StrictHostKeyChecking=no",
      "post-deploy" : "npm install && npm run test && pm2 startOrRestart ecosystem.config.js --env production"
    }
  }
};
