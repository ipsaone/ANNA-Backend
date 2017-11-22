'use strict';

const compileMd = () => {

}

module.exports = (sequelize, DataTypes) => {
    const Mission = sequelize.define('Mission', {
        name: {
            allowNull: false,
            type: DataTypes.STRING
        },
        markdown: {
            allowNull: true,
            type: DataTypes.STRING
        },
        description: {
            allowNull: true,
            type: DataTypes.STRING
        },
        budgetAssigned: {
            allowNull: true,
            type: DataTypes.INTEGER
        },
        budgetUsed: {
            allowNull: true,
            type: DataTypes.INTEGER
        },
        groupId: {
            allowNull: false,
            type: DataTypes.INTEGER
        },
        leaderId: {
            allowNull: false,
            type: DataTypes.INTEGER
        }
    }, {
        timestamps: true,
        hooks: {
            beforeCreate: compileMd,
            beforeUpdate: compileMd
        }
    });


    Mission.associate = function (models) {
        Mission.belongsTo(models.Group, {
            foreignKey: 'groupId',
            as: 'group',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });
        Mission.belongsTo(models.User, {
            foreignKey: 'leaderId',
            as: 'leader',
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE'
        });
    }

    return Mission;
};
