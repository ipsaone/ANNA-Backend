'use strict';

const db = require('../models');

const userIsRoot = (userId) => db.User.findOne({
    where: {id: userId},
    include: ['groups']
})
    .then((user) => {
        if (user && user.groups) {
            return user.groups;
        }

        return [];

    })

    // No case checking needed, they are stored lowercase
    .then((groups) => groups.find((group) => group.name === 'root'))

    // Return an error or the group
    .then((group) => typeof group !== 'undefined');


exports.filterIndex = () => Promise.resolve(true);

exports.filterShow = () => Promise.resolve(true);

exports.filterStore = (userId) => {
    if (userIsRoot(userId)) {
        return true;
    }

    throw new Error('Unauthorized');
};

exports.filterUpdate = (userId) => {
    if (userIsRoot(userId)) {
        return true;
    }

    throw new Error('Unauthorized');
};

exports.filterDelete = (userId) => {
    if (userIsRoot(userId)) {
        return true;
    }

    throw new Error('Unauthorized');
};
