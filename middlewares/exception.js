'use strict';


module.exports = (err, req, res, next) => {
    console.log('-------------------------------');
    console.log('Exception received by handler :\n', err);
    console.log('-------------------------------');

    if (!res.headersSent) {
        res.boom.badImplementation(err.message);
    }
};
