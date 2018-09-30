'use strict';


/**
 *
 * Deletes an existing group.
 *
 * @param {Object} req - The user request.
 * @param {Object} res - The response to be sent.
 *
 * @returns {Object} Promise.
 *
 */

module.exports = (db) => async function (req, res) {
    if (isNaN(parseInt(req.params.groupId, 10))) {
        throw res.boom.badRequest();
    }
    const groupId = parseInt(req.params.groupId, 10);

    const group = await db.Group.findById(groupId);

    if (!group) {
        throw res.boom.notFound();
    }

    await group.destroy({where: {id: groupId}});

    return res.status(204).json({});

};

