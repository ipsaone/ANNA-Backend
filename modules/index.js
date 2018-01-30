/* eslint new-cap: 0*/

'use strict';


const router = require('express').Router();
const config = require.main.require('./config/sequelize');
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const glob = require('glob');

const sequelize = new Sequelize(config.database, config.username, config.password, config);
const db = {};


const directories =
  fs.readdirSync(__dirname)
      .map((name) => path.join(__dirname, name))
      .filter((source) => fs.lstatSync(source).isDirectory())
      .map((folder) => path.basename(folder));


// Importing models and associations
const options = {
    root: __dirname,
    realpath: true
};
const modelFiles = glob.sync('./models/*.js', options);
const moduleFiles = glob.sync('./modules/**/models/*.js', options);
const toImport = modelFiles.concat(moduleFiles);

toImport.forEach((file) => {
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
module.exports.db = db;


// Importing routes
router.use('/', require('./home').routes);
directories.map((dir) => router.use(`/${dir}`, require(path.join(__dirname, dir)).routes));
router.all('*', (req, res) => res.boom.notFound());


module.exports.router = router;
