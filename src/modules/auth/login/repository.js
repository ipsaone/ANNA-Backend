'use strict';

const bcrypt = require('bcrypt');

module.exports.login = async (transaction, username, password) => {
    transaction.logger.debug('Finding user', {username});

    // Find user in database
    const user = await transaction.db.User.findOne({
        where: {username}
    });

    // Check user was found
    if (!user) {
        transaction.logger.debug('User not found');
        return false;
    }

    let secrets = await user.getSecrets();

    // Compare password to hash
    transaction.logger.debug('Comparing hashes');
    const passwordAccepted = await bcrypt.compare(password, secrets.password);

    if (!passwordAccepted) {
        transaction.logger.debug('Password refused');
        return false;
    }

    transaction.logger.debug('Password accepted');

    return user;
};
