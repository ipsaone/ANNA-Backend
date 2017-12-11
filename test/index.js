'use strict';

const tests = [
    'auth',
    'user',


    'post',
    'log',
    'mission',
    'event',
    'storage'

];

const mochaOptions = {timeout: 5000};

const runMigrations = false;

/*
 * ---------------------------------------------------------------------
 *  TESTS CONFIGURATION STOPS HERE
 * ----------------------------------------------------------------------
 */

process.env.test = 'true';
const Mocha = require('mocha');
const Umzug = require('umzug');
const path = require('path');
const db = require('../models');
const chai = require('chai');

chai.use(require('chai-http'));

const server = require('../app');
const seedAndLogin = require('./seed_and_login');

const agent = chai.request.agent(server);
const umzug = new Umzug({
    storage: 'sequelize',
    storageOptions: {sequelize: db.sequelize},
    migrations: {
        params: [
            db.sequelize.getQueryInterface(),
            db.Sequelize
        ],
        path: path.join(__dirname, '../migrations')
    }
});


global.agent = agent;

// Running migrations ...
new Promise((resolve) => {
    if (runMigrations) {
        return umzug.up();
    }

    resolve();

})

// Syncing database ...
    .then(() => db.sequelize.sync({force: true}))

// Logging in ...
    .then(() => seedAndLogin(agent))
    .then((userData) => {
        process.env.userData = userData;

        return true;
    })


// Starting tests ...
    .then(() => {
        let failures = 0;

        const promises = tests.map((item) =>
            new Promise((resolve) => {
                new Mocha(mochaOptions)
                    .addFile(path.join(__dirname, `./${item}.js`))
                    .run((testFailures) => {
                        failures += testFailures;
                    })
                    .on('end', () => {
                        console.log('Tests for', `${item}.js`, 'done !');
                        resolve();
                    });

            }));

        return Promise.all(promises).then(() => {
            console.log('Test complete with', failures, 'errors !');

            // eslint-disable-next-line no-process-exit
            return process.exit(failures); // Exit with non-zero status if there were failures
        });
    })

// Error handling
    .catch((err) => {
        throw err;
    });

