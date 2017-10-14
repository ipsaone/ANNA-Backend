'use strict';

const fs = require('fs');

let config = {
    app: {
        name: 'A.N.N.A',
        version: '1.0.0'
    },

    env: {
        vagrant: {
            host: '192.168.50.5',
            port: 8080
        },
        dev: {
            host: '127.0.0.1',
            port: 8080
        },

        prod: {
            host: '127.0.0.1',
            port: 8080
        },
    },

    sequelize: {
        dialect: 'mysql',
        host: '127.0.0.1',
        username: 'root',
        password: 'OneServ_2017',
        database: 'ipsaone',
        logging: false // Prevent Sequelize from outpouting the query on the console
    },

    session: {
        socket: '/var/run/redis/redis.sock',
        secret: 'HYlFhWoHBGPxVnHqP45K',
    },

    storage: {
        folder: 'storage',
    }
};

config.app.getCertificates = () => {
    let privateKey, certificate;

    if (config.app.env === 'production') {
        privateKey = fs.readFileSync('sslcert/private.key', 'utf8');
        certificate = fs.readFileSync('sslcert/certificate.crt', 'utf8');

        console.log('Using one.ipsa.fr certificate');
    } else { // Development
        privateKey = fs.readFileSync('sslcert/localhost.key', 'utf8');
        certificate = fs.readFileSync('sslcert/localhost.crt', 'utf8');

        console.log('Using localhost certificate');
    }

    return {key: privateKey, cert: certificate};
};

config.app.getConnection = () => {
    let host, port;

    if (config.app.env === 'production') {
        host = config.env.prod.host;
        port = config.env.prod.port;
    } else if (process.env.ONEOS == "true") {
        host = config.env.vagrant.host;
        port = config.env.vagrant.port;
    } else {
        host = config.env.dev.host;
        port = config.env.dev.port;
    }

    return {host: host, port: port};
};


module.exports = config;