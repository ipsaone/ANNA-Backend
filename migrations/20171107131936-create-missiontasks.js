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
            missionId: {
                allowNull: false,
                type: Sequelize.INTEGER,
                onDelete: 'CASCADE',
                references: {
                    model: 'Mission',
                    key: 'id'
                },
            },
            taskId: {
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
