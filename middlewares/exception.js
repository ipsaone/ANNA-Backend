'use strict';


module.exports = (err, req, res, next) => {

    console.log('-------------------------------');
    console.log('Exception received by handler :');
    console.log(err);
    console.log('-------------------------------');

    if (!res.headersSent && typeof res.boom !== 'undefined') {
        res.boom.badImplementation(err.message);
    } else {
        console.log('Couldn\'t handle error :', err);
    }
}
