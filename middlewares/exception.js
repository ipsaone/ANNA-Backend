'use strict';


module.exports = (err, req, res, next) => {
    console.log("Exception received by handler");

    if(boom.isBoom(err)) {
        res.send(err);
    } else {
        res.boom.badImplementation(err.message);
    }
}
