/* eslint no-sync: 0 */

'use strict';

const fs = require('fs');
require('dotenv').config();

const config = {
    app: {
        name: 'A.N.N.A',
        version: '1.1.0'
    },

    password: {salt: 10},

    email: {
        sender: 'oneBugReporter',
        password: 'oneBug_2018',
        errorManagers: [
            'declaverie@gmail.com',
            'clement.chandon@gmail.com'
        ],
        auth: {
            type: 'oauth2',
            user: 'YOUR_GMAIL_ADDRESS',
            clientId: 'YOUR_CLIENT_ID',
            clientSecret: 'YOUR_CLIENT_SECRET',
            refreshToken: 'YOUR_REFRESH_TOKEN',
        }
    },


    session: {
        socket: '/var/run/redis/redis.sock',
        secret: 'HYlFhWoHBGPxVnHqP45K',
        check: process.env.CHECK_AUTH,
        timeout: 1000*60*1
    },

    logging: {level: 'debug'},

    get sequelize () {
        return {
            dialect: 'mysql',
            host: process.env.DB_HOST,
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            redis: this.session,
            force: process.env.DB_FORCE_SYNC,
            dialectOptions: {socketPath: '/var/run/mysqld/mysqld.sock'},
            pool: {
                min: 5,
                max : 130,
            }
        };

    },

    get sequelizeTest () {
        return {
            dialect: 'sqlite',
            host: '',
            username: '',
            password: '',
            logging: data => 
                fs.appendFileSync.bind(null, "./logs/db_test.log"), // Prevent Sequelize from outputting the query on the console
            redis: this.session,
            force: true,
            pool: {
                maxConnections: 50,
                maxIdleTime: 10
            }
        };
    },

    storage: {
        folder: './storage',
        temp: '/tmp'
    }
};


config.app.getConnection = () => ({
    host: process.env.HOST,
    port: process.env.PORT
});


module.exports = config;
