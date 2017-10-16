'use strict';

require('dotenv').config();

const fs = require('fs');

let config = {
    app: {
        name: 'A.N.N.A',
        version: '1.0.0'
    },

    password: {
        salt: 10
    },

    sequelize: {
        dialect: 'mysql',
        host: process.env.DB_HOST,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        logging: false // Prevent Sequelize from outputting the query on the console
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

    if (process.env.DEV === 'true') {
        privateKey = fs.readFileSync('sslcert/localhost.key', 'utf8');
        certificate = fs.readFileSync('sslcert/localhost.crt', 'utf8');

        console.log('Using localhost certificate');
    } else { // Production
        privateKey = fs.readFileSync('sslcert/private.key', 'utf8');
        certificate = fs.readFileSync('sslcert/certificate.crt', 'utf8');

        console.log('Using one.ipsa.fr certificate');
    }

    return {key: privateKey, cert: certificate};
};


config.app.getConnection = () => {
    return {host: process.env.HOST, port: process.env.PORT};
};


module.exports = config;