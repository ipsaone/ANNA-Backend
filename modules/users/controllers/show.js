'use strict';

const findRoot = require('find-root');
const root = findRoot(__dirname);
const path = require('path');
const db = require(path.join(root, './modules'));

/**
 *
 * Get a single user.
 *
 * @param {obj} req     - The user request.
 * @param {obj} res     - The response to be sent.
 *
 * @returns {Object} Promise.
 *
 */

module.exports = async function (req, res) {
    if (isNaN(parseInt(req.params.userId, 10))) {
        throw res.boom.badRequest();
    }
    const userId = parseInt(req.params.userId, 10);

    const user = await db.User.findOne({
        where: {id: userId},
        include: [
            'groups',
            'events',
            'participatingMissions'
        ]
    });

    if (!user) {
        throw res.boom.notFound();
    }

    return res.status(200).json(user);

};
