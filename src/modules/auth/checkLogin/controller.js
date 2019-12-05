'use strict';


/**
 * @api {get} /auth/check Check if the current user is logged in
 * @apiName checkLogin
 * @apiGroup Auth
 */




module.exports = function (db) {

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
