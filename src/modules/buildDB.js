module.exports = (sequelize) => {
    const db = {};

    // Importing models and associations
    const options = {
        root: __dirname,
        realpath: true
    };
    const modelFiles = require('glob').sync('./src/models/*.js', options);
    const moduleFiles = require('glob').sync('./src/modules/**/models/*.js', options);

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
    db.Sequelize = require('sequelize');

    return db;
};