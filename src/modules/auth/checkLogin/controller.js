'use strict';


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
