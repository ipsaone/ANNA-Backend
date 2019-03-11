'use strict';

module.exports = {
 
    up: (queryInterface, Sequelize) => 
        queryInterface.addColumn('Data', 'serialNbr', {
            allowNull: true,
            type: Sequelize.STRING
        })
    ,

    down: (queryInterface) => 
        queryInterface.removeColumn('Data', 'serialNbr')
};
