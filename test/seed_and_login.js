'use strict';

const db = require('../models');
const server = require('../app');
const Chance = require('chance');
const chai = require('chai');
let chance = new Chance(Math.random);

let seed_options = {
    min_users: 10,
    max_users: 40,
    min_groups: 10,
    max_groups: 80
};

let seed_data = {};
let randoms = {};

module.exports = (agent) => {

    /* 1. CLEAR */
    return db.sequelize.sync({force: true})


    /* 2. SEED */
    .then(() => {

            // a) users
        seed_data.users = chance.integer({min: seed_options.min_users, max: seed_options.max_users});
        let user_promises = [];
        randoms.usernames = chance.unique(chance.string, seed_data.users, {length: chance.integer({min: 8, max: 25})});
        randoms.passwords = chance.unique(chance.string, seed_data.users, {length: chance.integer({min: 5, max: 40})});
        randoms.emails    = chance.unique(chance.email, seed_data.users)
        for(let i = 0; i < seed_data.users; i++) {
            user_promises.push(db.User.create({username: randoms.usernames[i], password: randoms.passwords[i], email: randoms.emails[i]}));
        }
        return Promise.all(user_promises)
    }).then(() => {

            // b) groups
        seed_data.groups = chance.integer({min: seed_options.min_groups, max: seed_options.max_groups});
        let group_promises = [];
        randoms.names = chance.unique(chance.string, seed_data.groups, {length: chance.integer({min: 5, max: 12})});
        for(let i = 0; i < seed_data.groups; i++) {
            group_promises.push(db.Group.create({name: randoms.names[i]}));
        }
        return Promise.all(group_promises);
    }).then(() => {

            // c) user-group associations
        seed_data.userGroups = chance.integer({min: 1, max: Math.min(seed_data.users, seed_data.groups)});
        let userGroup_promises = []
        let userIds = chance.unique(chance.integer, seed_data.userGroups, {min: 1, max: seed_data.users});
        let groupIds = chance.unique(chance.integer, seed_data.userGroups, {min: 1, max: seed_data.groups});
        for(let i = 0; i < seed_data.userGroups; i++) {
            userGroup_promises.push(db.Group.findById(groupIds[i]).then(group => group.addUser(userIds[i])));
        }

        return Promise.all(userGroup_promises);
    })


    /* 3. LOGIN */
    .then(() => new Promise(resolve => setTimeout(resolve, 5000)))
    .then(() => {
        let user = chance.integer({min: 1, max: seed_data.users});
        return agent
            .post('/auth/login')
            .send({username: randoms.usernames[user], password: randoms.passwords[user]})
    })



}
