'use strict';

describe('Testing the installation', () => {
    const chai = require('chai');
    const chaiHttp = require('chai-http');
    const config = require('./config');
    const mysql = require('mysql2');
    const fs = require('fs');

    const expect = chai.expect;
    chai.use(chaiHttp);

    describe('PHPMyAdmin connection', () => {
        it('expect no errors and to have the status code 200', done => {
            chai.request('http://127.0.0.1/phpmyadmin')
                .get('/')
                .end((err, res) => {
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);
                    done();
                });
        });
    });

    describe('MySQL connection', () => {
        it('expect no errors', done => {
            mysql.createConnection({
                host: config.sequelize.host,
                user: config.sequelize.username,
                password: config.sequelize.password,
                database: config.sequelize.database,
                waitForConnections: true,
                connectionLimit: 500
            }).connect(err => {
                expect(err).to.be.null;
                done();
            });
        });
    });

    describe('Redis connection', () => {
        it('expect the redis.sock and redis-server.pid files to exist', done => {
            expect(fs.existsSync('/var/run/redis/redis.sock') && fs.existsSync('/var/run/redis/redis-server.pid')).to.be.true;
            done();
        });
    });

    after(() => process.exit(0));
});