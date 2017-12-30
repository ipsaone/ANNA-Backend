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

exports.filterStoreRegistered = async (eventId, targetId, userId) => {

    if (userId === targetId) {
        return true;
    }

    const user = await db.User.findById(userId);
    const userIsAdmin = await user.isRoot();

    if (userIsAdmin) {
        return true;
    }

    return false;
};

exports.filterDeleteRegistered = async (eventId, targetId, userId) => {

    if (userId === targetId) {
        return true;
    }

    const user = await db.User.findById(userId);
    const userIsAdmin = await user.isRoot();

    if (userIsAdmin) {
        return true;
    }

    return false;
};
