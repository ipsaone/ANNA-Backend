/* eslint no-sync: 0 */

'use strict';

require('dotenv').config();

/*
 * Logs a SQL request.
 *
 * @param data - The data to log.
 * @returns True.
 */
const config = {
    app: {
        name: 'A.N.N.A',
        version: '1.0.0'
    },

    password: {salt: 10},

    session: {
        socket: '/var/run/redis/redis.sock',
        secret: 'HYlFhWoHBGPxVnHqP45K',
        check: process.env.CHECK_AUTH
    },

    log: (data) => {
        const now = new Date();

        console.log(`[${now.toISOString()}] ${data}\n`);

        return true;
    },

    logging: {level: 'debug'},

    get sequelize () {
        return {
            dialect: 'mysql',
            host: process.env.DB_HOST,
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            logging: false,
            redis: this.session,
            force: process.env.DB_FORCE_SYNC,
            operatorsAliases: false,
            dialectOptions: {socketPath: '/var/run/mysqld/mysqld.sock'},
            pool: {
                maxConnections: 50,
                maxIdleTime: 10
            }
        };

    },

    get sequelizeTest () {
        return {
            dialect: 'sqlite',
            host: '',
            username: '',
            password: '',
            logging: false, // Prevent Sequelize from outputting the query on the console
            redis: this.session,
            force: true,
            operatorsAliases: false,
            pool: {
                maxConnections: 50,
                maxIdleTime: 10
            }
        };
    },

    storage: {
        folder: '../storage',
        temp: '/tmp'
    }
};


config.app.getConnection = () => ({
    host: process.env.HOST,
    port: process.env.PORT
});


module.exports = config;
