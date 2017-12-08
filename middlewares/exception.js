'use strict';


module.exports = (err, req, res, next) => {

    console.log('-------------------------------');
    console.log('Exception received by handler :');
    console.log('error type :', typeof err);
    //console.log(err)
    console.trace();
    console.log('-------------------------------');

    if (!res.headersSent && typeof res !== 'undefined' && typeof res.boom !== 'undefined') {
        res.boom.badImplementation(err.message);
    } else {
        console.log('Couldn\'t handle error manually');
        next(err);
    }


}
