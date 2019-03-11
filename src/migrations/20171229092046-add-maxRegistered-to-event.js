'use strict';

module.exports = {

    up: (queryInterface, Sequelize) => 
        queryInterface.addColumn('Events', 'maxRegistered', {
            allowNull: true,
            defaultValue: Sequelize.NULL,
            type: Sequelize.INTEGER
        })
    ,

    down: (queryInterface) => 
        queryInterface.removeColumn('Events', 'maxRegistered')
    
};
