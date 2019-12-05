'use strict';

/**
 * @api {post} /auth/getToken Send a password reset token by email
 * @apiName getToken
 * @apiGroup Auth
 * 
 * @apiParam {string} email The user's email address
 */

require('dotenv').config();
let joi = require('joi');
let crypto = require('crypto');
const util = require('util');


let schema = joi.object().keys({
    email: joi.string().email().required()
});


module.exports = function (db) {

    return async (req, res) => {

        // Validate user input
        req.transaction.logger.info('Validating schema');
        const validation = joi.validate(req.body, schema);
        if (validation.error) {
            req.transaction.logger.info('Schema validation failed', {error : validation.error})
            return res.boom.badRequest(validation.error);
        }

        let user = await db.User.findOne({where: { email : req.body.email }});
        if(!user) {
            return res.boom.badRequest("User not found");
        }

        // Generate new token (1 round of SHA-256 from a 128-bit random value)
        // See : https://security.stackexchange.com/questions/213975
        let value = await util.promisify(crypto.randomBytes)(128);
        let secret = await util.promisify(crypto.randomBytes)(128);
        let token = crypto.createHmac('sha256', secret).update(value).digest('hex');

        // Save it
        let secrets = await user.getSecrets()
        await secrets.update({resetToken: token, resetTokenDate: Date.now()});

        // Send it by email
        if(req.body.sendEmail && req.transaction.mg) {
            // Send it by email
            // send mail with defined transport object
            let data = {
                from: '"IPSA ONE" <admin@mail.ipsaone.space>', // sender address
                to: req.body.email, // list of receivers
                subject: 'ANNA password reset', // Subject line
                text:  `
                    Dear user,

                    Here is your password reset link : http://ipsaone.space/login?resetToken='+token+'"

                    Cheers,
                    The IPSA ONE Team
                `,
            };

            req.transaction.mg.messages().send(data, (err, body) => {

                // Send response
                let rep = {ok: body.id ? true : false};
                if(process.env.TEST) { rep.token = token; }
                return res.status(200).json(rep);
            });
        } else {
        
            // Send response
            let rep = {ok: false};
            if(process.env.TEST) { rep.token = token; }
            return res.status(200).json(rep);
        }

        
        
    };
};
