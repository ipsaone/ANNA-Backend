'use strict';

let compileMd = () => {

}

module.exports = (sequelize, DataTypes) => {
    const Mission = sequelize.define('Mission', {
        name: {allowNull: false, type: DataTypes.STRING},
        description_md: {allowNull: true, type: DataTypes.STRING},
        description_html: {allowNull: true, type: DataTypes.STRING},
        // group_id
        // leader_id
        // budget_assigned
        // budget_used
        // tasks_list_id
            // task : {name[str], done[bool], task_list_id}
            // task_list : {name[str], }
    }, {
        timestamps: true,
        hooks: {
            beforeCreate: compileMd,
            beforeUpdate: compileMd
        }
    });

    return Data;
};