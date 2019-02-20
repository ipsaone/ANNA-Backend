'use strict';

/**
 * @param {db} obj
 */

module.exports = function (db) {

    /**
     *
     * Logs in a user.
     *
     * @param {obj} req      - The user request.
     * @param {obj} res      - The response to be sent.
     *
     * @returns {Object} Promise.
     *
     */
    return async (req, res) => {

        let logged = false;
        if(req.session.auth) {
            logged = true;
        }

        req.transaction.logger.debug('Checking login', {logged: req.session.auth});

        // Send response
        return res.status(200).json({logged});
    };
};
