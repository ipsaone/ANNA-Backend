'use strict';

const db = require('../models');

before('Init database', () => {
    db.sequelize.transaction(function (t) {
        const options = {raw: true, transaction: t};

        db.sequelize
            .query('SET FOREIGN_KEY_CHECKS = 0', null, options)
            .then(() => db.sequelize.sync({force: true}))
            .then(() => db.sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, options))
            .then(function () {
                return t.commit();
            });
    });
});
