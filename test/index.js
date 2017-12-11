'use strict';
process.env.test = 'true';

const tests = [
    'auth',
    'user'

/*
 *    'post',
 * 'log',
 * 'mission',
 * 'event'
 */
];

const mochaOptions = {timeout: 5000};
const runMigrations = false;

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
new Promise(() => !runMigrations || umzug.up())

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

        let promises = tests.map((item) =>
            new Promise((resolve) => {
                new Mocha(mochaOptions)
                    .addFile(path.join(__dirname, `./${item}.js`))
                    .run((testFailures) => {
                        failures += testFailures;
                    })
                    .on('end', () => {
                        console.log('Tests for', item+'.js',  'done !');
                        resolve();
                    });

                }));


        Promise.all(promises).then(() => {
            console.log('Test complete with', failures, 'errors !');
            // eslint-disable-next-line no-process-exit
            process.exit(failures) // Exit with non-zero status if there were failures
        });

        return true;
    })

// Error handling
    .catch((err) => {
        throw err;
    });

