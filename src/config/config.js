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

    session: {
        socket: '/var/run/redis/redis.sock',
        secret: 'HYlFhWoHBGPxVnHqP45K',
        check: process.env.CHECK_AUTH,
        test_host: 'localhost',
        test_port: '6379',
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
                min: 0,
                max : 20,
                idle: 1000,
                evict: 1000
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


config.app.getConnection = () => {
    if(process.env.NODE_ENV === 'production') {
        return {
            host: process.env.PROD_HOST,
            port: process.env.PROD_PORT
        }
    } else if(process.env.NODE_ENV === 'staging') {
        return {
            host: process.env.STAGING_HOST,
            port: process.env.STAGING_PORT
        }
    } else {
        return {
            host: process.env.HOST,
            port: process.env.PORT
        }
    }
    
};


module.exports = config;
