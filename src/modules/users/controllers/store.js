'use strict';

const joi = require('joi');
const policy = require('../user_policy');

const schema = joi.object().keys({
    username: joi.string().min(4).required(),
    email: joi.string().min(5).required(),
    password: joi.string().min(6).required(),
    sendEmail: joi.bool().optional()
});

module.exports = (db) => async function (req, res) {

    // Validate user input
    req.transaction.logger.info('Validating schema');
    const validation = joi.validate(req.body, schema);
    if (validation.error) {
        req.transaction.logger.info('Schema validation failed');
        return res.boom.badRequest(validation.error);
    }

    req.transaction.logger.info('Invoking policies');
    let allowed = policy.filterStore(req.transaction, req.session.auth)
    if (!allowed) {
        req.transaction.logger.info('Policies denied access');
        return res.boom.unauthorized();
    }

    req.transaction.logger.info('Creating user');
    const user = await db.User.create(req.body);

    req.transaction.logger.info('Adding to default group');
    let group = await req.transaction.db.Group.findAll({where: {name: 'default'}});
    await user.addGroup(group);

    let mailok = false;
    if(req.body.sendEmail) {
        // Send it by email
        // send mail with defined transport object
        let info = await req.transaction.mailer.sendMail({
            from: '"IPSA ONE" <noreply@ipsaone.space>', // sender address
            to: user.email, // list of receivers
            subject: 'ANNA Account created', // Subject line
            html:  `
            Your username : "", your password : ""\n
            You can access ANNA at the following address : <a href="https://anna.ipsaone.space/">https://anna.ipsaone.space/</a>\n\n
            Please change your password in your personnal space as soon as possible !
            `,
        });

        if(info.accepted.length == 1) {
            mailok = true;
        }
    }
    
    req.transaction.logger.info('Returning response');
    return res.status(201).json({id: user.id, mailSent: mailok});

};
