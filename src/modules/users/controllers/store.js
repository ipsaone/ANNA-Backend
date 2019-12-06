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

    if(req.body.sendEmail && req.transaction.mg) {
        // Send it by email
        // send mail with defined transport object
        let data = {
            from: '"IPSA ONE" <admin@mail.ipsaone.space>', // sender address
            to: user.email, // list of receivers
            subject: 'ANNA account created', // Subject line
            text:  `
                Dear user,

                Your username : "`+user.username+`", your password : "`+user.password+`"
                You can access ANNA at the following address : https://anna.ipsaone.space/

                Please change your password in your personnal space as soon as possible !

                In case of problem, feel free to contact your team leader !

                Cheers,
                The IPSA ONE team
            `,
        };

        req.transaction.mg.messages().send(data, (err, body) => {
            req.transaction.logger.info('Returning response');
            return res.status(201).json({id: user.id, mailSent: body.id ? true : false});
        });
    } else {
    
        req.transaction.logger.info('Returning response');
        return res.status(201).json({id: user.id, mailSent: false});
    }

};
