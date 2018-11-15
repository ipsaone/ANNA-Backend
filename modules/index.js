/* eslint new-cap: 0*/

'use strict';

const findRoot = require('find-root');
const root = findRoot(__dirname);
const path = require('path');

const Sequelize = require('sequelize');

const buildRouter = (db) => {
    // Importing routes
    const router = require('express').Router();

    router.use('/', require('./home').routes);
    const directories =
          require('fs').readdirSync(path.join(root, 'modules'))
              .map((name) => path.join(root, 'modules', name))
              .filter((source) => require('fs').lstatSync(source)
                  .isDirectory())
              .map((folder) => path.basename(folder));

    directories.map((dir) => {
        const thisModule = require(path.join(root, 'modules', dir));

        router.use(`/${dir}`, thisModule.routes(db));

        return true;
    });
    //router.all('*', (req, res) => res.boom.notFound());

    return router;
};

const buildDB = (sequelize) => {
    const db = {};

    // Importing models and associations
    const options = {
        root: __dirname,
        realpath: true
    };
    const modelFiles = require('glob').sync('./models/*.js', options);
    const moduleFiles = require('glob').sync('./modules/**/models/*.js', options);

    modelFiles.concat(moduleFiles).forEach((file) => {
        const model = sequelize.import(file);

        db[model.name] = model;
    });
    Object.keys(db).forEach((modelName) => {
        if (db[modelName].associate) {
            db[modelName].associate(db);
        }
    });

    db.sequelize = sequelize;
    db.Sequelize = Sequelize;

    return db;
};

module.exports = class ModuleFactory {
    constructor (options) {
        let test = false;

        if (options && options.test) {
            test = true;
        }

        this.configPath = './config/sequelize';
        if (test) {
            this.configPath = './config/sequelize_test';
        }

        const config = require(path.join(root, this.configPath));


        if (test) {
            // For tests, load in-memory SQLite database !
            this.testDatabases = 0;
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
