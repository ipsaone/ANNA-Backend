'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        queryInterface.addColumn('Data', 'isDir', {
            allowNull: false,
            defaultValue: Sequelize.FALSE,
            type: Sequelize.BOOLEAN
        });
    },

    down: (queryInterface) => {
        queryInterface.removeColumn('Data', 'isDir');
    }
};
