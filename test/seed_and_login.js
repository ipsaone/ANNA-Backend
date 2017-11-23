'use strict';

const db = require('../models');
const Chance = require('chance');
const chance = new Chance(Math.random);

const seedOptions = {

    maxGroups: 80,
    maxUsers: 40,

    minGroups: 10,
    minUsers: 10

};

const seedData = {};
const randoms = {};

module.exports = (agent) =>

    /* 1. CLEAR */
    db.sequelize.sync({force: true}).


    /* 2. SEED */
        then(() => {

            // A) users
            seedData.users = chance.integer({
                min: seedOptions.minUsers,
                max: seedOptions.maxUsers
            });
            const user_promises = [];

            randoms.usernames = chance.unique(chance.string, seedData.users, {
                length: chance.integer({
                    min: 8,
                    max: 25
                })
            });
            randoms.passwords = chance.unique(chance.string, seedData.users, {
                length: chance.integer({
                    min: 5,
                    max: 40
                })
            });
            randoms.emails = chance.unique(chance.email, seedData.users)
            for (let i = 0; i < seedData.users; i++) {
                user_promises.push(db.User.create({
                    username: randoms.usernames[i],
                    password: randoms.passwords[i],
                    email: randoms.emails[i]
                }));
            }

            return Promise.all(user_promises)
        }).
        then(() => {

            // B) groups
            seedData.groups = chance.integer({
                min: seedOptions.minGroups,
                max: seedOptions.maxGroups
            });
            const groupPromises = [];

            randoms.names = chance.unique(chance.string, seedData.groups, {
                length: chance.integer({
                    min: 5,
                    max: 12
                })
            });
            for (let i = 0; i < seedData.groups; i++) {
                groupPromises.push(db.Group.create({name: randoms.names[i]}));
            }

            return Promise.all(groupPromises);
        }).
        then(() => {

            // C) user-group associations
            seedData.userGroups = chance.integer({
                min: 1,
                max: Math.min(seedData.users, seedData.groups)
            });
            const userGroupPromises = []
            const userIds = chance.unique(chance.integer, seedData.userGroups, {
                min: 1,
                max: seedData.users
            });
            const groupIds = chance.unique(chance.integer, seedData.userGroups, {
                min: 1,
                max: seedData.groups
            });

            for (let i = 0; i < seedData.userGroups; i++) {
                userGroupPromises.push(db.Group.findById(groupIds[i]).then((group) => group.addUser(userIds[i])));
            }

            return Promise.all(userGroupPromises);
        }).


    /* 3. LOGIN */
        then(() => new Promise((resolve) => setTimeout(resolve, 5000))).
        then(() => {
            const user = chance.integer({
                min: 1,
                max: seedData.users
            });
            const userData = {
                username: randoms.usernames[user],
                password: randoms.passwords[user]
            }


            return agent.
                post('/auth/login').
                send(userData).
                then(() => userData)
        })


