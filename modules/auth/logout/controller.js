'use strict';

/**
 *
 * Logs out a user.
 *
 * @param {Object} req - the user request
 * @param {Object} res - the response to be sent
 *
 * @returns {Object} promise
 *
 */


module.exports = () => (req, res) => {

    // Reset session data
    req.session.auth = null;
    req.session.save();

    // Send response
    return res.status(200).json({});
};
