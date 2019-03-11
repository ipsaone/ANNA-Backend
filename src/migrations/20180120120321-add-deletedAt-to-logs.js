'use strict';

module.exports = {

    up: (queryInterface, Sequelize) => 
        queryInterface.addColumn('Logs', 'deletedAt', {
            allowNull: true,
            type: Sequelize.DATE
        })
    ,

    down: (queryInterface) => 
        queryInterface.removeColumn('Logs', 'deletedAt')
    
};
