'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('MissionTasks', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            MissionId: {
                allowNull: false,
                type: Sequelize.INTEGER,
                onDelete: 'CASCADE',
                references: {
                    model: 'Mission',
                    key: 'id'
                },
            },
            TaskId: {
                allowNull: false,
                type: Sequelize.INTEGER,
                onDelete: 'CASCADE',
                references: {
                    model: 'Task',
                    key: 'id'
                },
            }
        });
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('MissionTasks');
    }
};
