'use strict';

module.exports = {

    up: (queryInterface, Sequelize) => 
        queryInterface.addColumn('Data', 'hidden', {
            allowNull: false,
            type: Sequelize.BOOLEAN,
            defaultValue: false
        })
    ,

    down: (queryInterface) => 
        queryInterface.removeColumn('Data', 'hidden')
    
};
