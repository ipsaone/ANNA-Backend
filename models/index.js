'use strict';

/**
 * @file
 * @see {@link module:index}
 */

/**
 * @module index
 */

/**
 * The file system module from nodeJS.
 * @constant fs
 * @see {@link https://nodejs.org/api/fs.html}
 */
const fs = require('fs');

/**
 * The path module from nodeJS.
 * @constant path
 * @see {@link https://nodejs.org/api/path.html}
 */
const path = require('path');

/**
 * The Object Relationnal Module 'sequelize'
 * @constant
 * @see {@link http://docs.sequelizejs.com/}
 */
const Sequelize = require('sequelize');

/**
 * The path.basename() methods returns the last portion of a path.
 * @constant basename
 * @see {@link https://nodejs.org/api/path.html#path_path_basename_path_ext}
 */
const basename = path.basename(__filename);

/**
 * @constant db
 */
const db = {};

/**
 * @var config - Defined with let
 */
let config = {};

/**
 * If running tests, uses test database,
 * Else uses production database.
 * @function path.join
 */

if (typeof process.env.test !== 'undefined' && process.env.test === 'true') {
    console.log('Using test database');
    config = require(path.join(__dirname, '../config/test'));
} else {
    console.log('Using production database');
    config = require(path.join(__dirname, '../config/sequelize'));
}

/**
 * Creates a new sequelize object.
 * @function sequelize
 * @class
 * @param {STRING} config.database The name of the database
 * @param {STRING} config.username A username
 * @param {STRING} config.password A password
 * @param {Object} config The config object
 */

/**
 *
 * @const Sequelize
 */
const sequelize = new Sequelize(config.database, config.username, config.password, config);

fs

    /**
     * Reads all files in the chosen directory.
     * @function readdirSync
     * @param {STRING} __dirname The directory which contains the file read by the function.
     */
    .readdirSync(__dirname)

    /**
     * Keeps only .js files
     * @function filter
     * @param file The file checked by the function.
     */
    .filter((file) => file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js')

    /**
     * Adds js files to the database.
     * @function forEach
     * @param file The file added in the database.
     */
    .forEach((file) => {
        const model = sequelize.import(path.join(__dirname, file));

        db[model.name] = model;
    });

/**
 * Sets associations.
 */
Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
