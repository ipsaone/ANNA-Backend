'use strict';

const db = require.main.require('./modules');

/**
 *
 * Updates an existing group.
 *
 * @param {Object} req - The user request.
 * @param {Object} res - The response to be sent.
 *
 * @returns {Object} Promise.
 *
 */

module.exports = async function (req, res) {
    if (typeof req.body.name !== 'string' || isNaN(parseInt(req.params.groupId, 10))) {
        throw res.boom.badRequest();
    }
    const groupId = parseInt(req.params.groupId, 10);

    /*
     * To lower case to avoid security problems
     * (users trying to create 'auTHOrs' group to gain rights)
     */
    req.body.name = req.body.name.toLowerCase();

    try {
        await db.Group.update(req.body, {where: {id: groupId}});

        return res.status(204).json({});
    } catch (err) {
        if (err instanceof db.Sequelize.ValidationError) {
            throw res.boom.badRequest();
        }
        throw err;
    }
};
