'use strict';

const db = require.main.require('./models');
const bcrypt = require('bcrypt');

module.exports = async (username, password) => {
    // Find user in database
    const user = await db.User.findOne({
        where: {username},
        include: [
            'groups',
            'events',
            'participatingMissions'
        ]
    });

    // Check user was found
    if (!user) {
        return false;
    }

    // Compare password to hash
    const passwordAccepted = await bcrypt.compare(password, user.password);

    if (!passwordAccepted) {
        return false;
    }


    return user;
};
