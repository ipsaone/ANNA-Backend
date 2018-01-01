'use strict';

/**
 * @file
 * @see {@link module:event}
 */

/**
 * @module event
 */

const db = require('../models');

exports.filterIndex = () => Promise.resolve(true);

exports.filterShow = () => Promise.resolve(true);

exports.filterStore = async (userId) => {
    const user = await db.User.findById(userId);

    if (user && await user.isRoot()) {
        return true;
    }

    throw new Error('Unauthorized');
};

exports.filterUpdate = async (userId) => {
    const user = await db.User.findById(userId);

    if (user && await user.isRoot()) {
        return true;
    }

    throw new Error('Unauthorized');
};

exports.filterDelete = async (userId) => {
    const user = await db.User.findById(userId);

    if (user && await user.isRoot()) {
        return true;
    }

    throw new Error('Unauthorized');
};
