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

    req.transaction.logger.info("Logout controller invoked");

    // Reset session data
    req.session.auth = null;
    req.session.save();

    req.transaction.logger.info("Logout successful");

    // Send response
    return res.status(200).json({});
};
