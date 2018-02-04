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
    router.all('*', (req, res) => res.boom.notFound());

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
        if (options && options.test) {
            this.configPath = './config/sequelize_test';
        } else {
            this.configPath = './config/sequelize';
        }

        const config = require(path.join(root, this.configPath));

        this.testDatabases = 0;
        this.db = buildDB(new Sequelize(config.database, config.username, config.password, config));
        this.router = buildRouter(this.db);
    }

    async unitTest () {
        this.testDatabases += 1;

        const options = {
            dialect: 'sqlite',
            logging: false, // Prevent Sequelize from outputting the query on the console
            // Logging: console.log,
            redis: this.session,
            force: true,
            operatorsAliases: false,
            pool: {
                maxConnections: 50,
                maxIdleTime: 10
            }
        };

        const sequelizeTest = new Sequelize(`test${this.testDatabases}`, null, null, options);
        const db = buildDB(sequelizeTest);

        await db.sequelize.sync({force: true});
        await require('sequelize-fixtures').loadFile('modules/**/fixtures/*.js', db, {log: () => null});

        return db;
    }
};
