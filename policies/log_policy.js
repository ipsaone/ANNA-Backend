'use strict';

const db = require('../models');
const userPolicy = require('./user_policy');
const allowed = [
    'title',
    'markdown'
];

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


exports.filterIndex = (l, userId) => {
    const logs = l.map((log) => log.toJSON());

    const p = logs.map((log, index) => userPolicy
        .filterShow(log.author, userId)
        .then((user) => {
            logs[index].author = user;

            return true;
        }));


    return Promise.all(p).then(() => logs);
};


exports.filterShow = async (l, userId) => {
    const log = l.toJSON();

    log.author = await userPolicy.filterShow(log.author, userId);

    return Promise.resolve(log);
};


exports.filterStore = (builder, userId) => {
    const keys = Object.keys(builder);

    keys.forEach((key) => {
        if (!allowed.includes(key)) {
            delete builder[key];
        }
    });

    builder.authorId = userId;

    return Promise.resolve(builder);
};


exports.filterUpdate = (builder, logId, userId) => userIsRoot(userId)
    // Check the user is root or is the author of the log
    .then((isRoot) => {
        if (isRoot) {
            return true;
        }

        return db.Log.findById(logId)
            .then((log) => log.authorId)
            .then((id) => {
                if (id === userId) {
                    return true;
                }
                throw new Error('Unauthorized');

            });

    })
    // Remove unauthorized fields
    .then(() => {
        const keys = Object.keys(builder);

        keys.forEach((key) => {
            if (!allowed.contains(key)) {
                delete builder[key];
            }
        });

        return true;
    })
    // Return builder object
    .then(() => builder);


exports.filterDelete = (userId) =>

    // Only root users can delete logs
    userIsRoot(userId)
        .then((isRoot) => {
            if (isRoot) {
                return true;
            }
            throw new Error('Unauthorized');

        });
