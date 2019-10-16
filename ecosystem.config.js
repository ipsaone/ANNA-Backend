module.exports = {
  apps : [{
    name: 'Backend API',
    script: '/home/chris/ANNA-Backend/src/app.js',

    // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
    args: '',
    cwd: '/home/chris/ANNA-Backend/',
    instances: 4,
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
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production'
    }
  }
};
