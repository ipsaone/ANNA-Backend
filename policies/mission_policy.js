'use strict';

const db = require('../models');

exports.filterIndex = () => Promise.resolve(true);

exports.filterShow = () => Promise.resolve(true);

exports.filterStore = async (userId) => {
    const user = await db.User.findById(userId);

    if (user && await user.isRoot()) {
        return true;
    }

    return false;
};

exports.filterUpdate = async (userId) => {
    const user = await db.User.findById(userId);

    if (user && await user.isRoot()) {
        return true;
    }

    return false;
};

exports.filterDelete = async (userId) => {
    const user = await db.User.findById(userId);

    if (user && await user.isRoot()) {
        return true;
    }

    return false;
};

exports.filterIndexTasks = () => true;
exports.filterShowTask = () => true;
exports.filterStoreTask = () => true;
exports.filterUpdateTask = async (contents, mission, userId) => {

    if (userId === mission.leaderId) {
        return contents;
    }

    const user = await db.User.findById(userId);

    if (await user.isRoot()) {
        return contents;
    }

    return [];
};
exports.filterDeleteTask = () => true;
