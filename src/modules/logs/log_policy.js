'use strict';

const findRoot = require('find-root');
const root = findRoot(__dirname);
const path = require('path');
const userPolicy = require(path.join(root, './src/modules/users/user_policy'));


exports.filterIndex = (db, logs, userId) => {

    const promises = logs.map((log) => log.toJSON()).map((log, index) => userPolicy
        .filterShow(db, log.author, userId)
        .then((user) => {
            logs[index].author = user;

            return true;
        }));


    return Promise.all(promises).then(() => logs);
};

exports.filterShow = async (transaction, log, userId) => {
    const filtered = log.toJSON();

    filtered.author = await userPolicy.filterShow(transaction, log.author);

    return filtered;
};


exports.filterStore = async (log, userId) => {
    return true;
};


exports.filterUpdate = async (db, logId, userId) => {
    const user = await db.User.findByPk(userId);

    if (user && await user.isRoot()) {
        return true;
    }

    const log = await db.Log.findByPk(logId);
    if (log.authorId === userId) {
        return true;
    }

    return false;
};


exports.filterDelete = async (db, userId) => {

    const user = await db.User.findByPk(userId);

    // Only root users can delete logs
    if (user && await user.isRoot()) {
        return true;
    }

    return false;

};
