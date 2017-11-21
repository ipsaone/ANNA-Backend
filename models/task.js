'use strict';


module.exports = (sequelize, DataTypes) => {
    const Task = sequelize.define('Task', {
        name: {allowNull: false, type: DataTypes.STRING},
        done: {allowNull: false, type: DataTypes.BOOLEAN, defaultValue: false},
        missionId: {allowNull: false, type: DataTypes.INTEGER}
    }, {
        timestamps: false
    });

    Task.associate = function(models) {
        Task.belongsTo(models.Mission, {foreignKey: 'missionId', as: 'mission', onDelete: 'RESTRICT', onUpdate: 'CASCADE'});
    }

    return Task;
};
