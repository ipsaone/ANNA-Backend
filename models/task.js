'use strict';


module.exports = (sequelize, DataTypes) => {
    const Task = sequelize.define('Task', {
        name: {allowNull: false, type: DataTypes.STRING},
        done: {allowNull: false, type: DataTypes.BOOLEAN, defaultValue: false}
    }, {
        timestamps: false,
    });

    return Task;
};
