/* eslint global-require: 0 */

'use strict';

describe('Test the installation', () => {
    const chai = require('chai');
    const expect = chai.expect;

    chai.use(require('chai-http'));

    describe('Apache connection', () => {
        it('expect no errors and to have the status code 200', (done) => {
            chai.request('http://127.0.0.1').
                get('/').
                end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);
                    done();
                });
        });
    });

    describe('PHPMyAdmin connection', () => {
        it('expect no errors and to have the status code 200', (done) => {

            chai.request('http://127.0.0.1/phpmyadmin').
                get('/').
                end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);
                    done();
                });
        });
    });

    describe('MySQL connection', () => {
        it('expect no errors', (done) => {
            const mysql = require('mysql2');
            const config = require('./config');

            mysql.createConnection({
                host: config.sequelize.host,
                user: config.sequelize.username,
                password: config.sequelize.password,
                database: config.sequelize.database,
                waitForConnections: true,
                connectionLimit: 100
            }).connect((err) => {
                expect(err).to.be.null;
                done();
            });
        });
    });

    describe('Redis connection', () => {
        const fs = require('fs');

        it('expect redis.sock and redis-server.pid files to exist', (done) => {
            expect(fs.existsSync('/var/run/redis/redis.sock') && fs.existsSync('/var/run/redis/redis-server.pid')).to.be.true;
            done();
        });
    });

    after(() => process.exit(0));
});
