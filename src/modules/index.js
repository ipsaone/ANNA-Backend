/* eslint new-cap: 0*/

'use strict';

const findRoot = require('find-root');
const root = findRoot(__dirname);
const path = require('path');
const uuidv4 = require('uuid/v4');

const Sequelize = require('sequelize');
const buildRouter = require('./buildRouter');
const buildDB = require('./buildDB');

module.exports = class ModuleFactory {
    constructor (options) {
        this.test = false;
        if (options && options.test) {
            this.test = true;
        }
        
        if(options && options.forceSync) {
            this.forceSync = options.forceSync;
        }

        this.configPath = './config/sequelize';
        if (this.test) {
            this.configPath = './config/sequelize_test';
        }

        const config = require(path.join(root, 'src', this.configPath));

        if (this.test) {
            // For tests, load in-memory SQLite database !
            let uuid = uuidv4();
            this.db = buildDB(new Sequelize(`test${this.testDatabases}`, null, null, config));
        } else {
            this.db = buildDB(new Sequelize(config.database, config.username, config.password, config));
        }

        this.router = buildRouter(this.db);
    }

    async syncDB () {
        await this.db.sequelize.sync({force: true});

        return this.db;
    }

};
