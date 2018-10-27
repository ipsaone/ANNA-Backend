'use strict';

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

module.exports = (db) => async function (req, res) {
    if (typeof req.body.name !== 'string' || isNaN(parseInt(req.params.groupId, 10))) {
        throw res.boom.badRequest('Group ID must be an integer');
    }
    const groupId = parseInt(req.params.groupId, 10);
    const group = await db.Group.findByPk(groupId);

    /*
     * To lower case to avoid security problems
     * (users trying to create 'auTHOrs' group to gain rights)
     */
    req.body.name = req.body.name.toLowerCase();

    try {
        await group.update(req.body);
        return res.status(200).json(group);
    } catch (err) {
        if (err instanceof db.Sequelize.ValidationError) {
            throw res.boom.badRequest(err);
        }
        throw err;
    }
};
