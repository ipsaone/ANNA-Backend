'use strict';

const chai = require('chai');
const db = require('../models');
const server = require('../app');
const expect = chai.expect;
const Chance = require('chance');
let chance = new Chance();

chai.use(require('chai-http'));
let agent = chai.request.agent(server);

let seed_options = {
    min_users: 10,
    max_users: 40,
    min_groups: 10,
    max_groups: 80
}

let seed_data = {};
let pool = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

module.exports = () => {



    /* 1. CLEAR */
    return db.sequelize.sync()


    /* 2. SEED */
    .then(() => {

            // a) users
        console.log("Seeding users");
        seed_data.users = chance.integer({min: seed_options.min_users, max: seed_options.max_users});
        let user_promises = [];
        module.usernames = chance.unique(chance.string, seed_data.users, {length: chance.integer({min: 8, max: 25})});
        module.passwords = chance.unique(chance.string, seed_data.users, {length: chance.integer({min: 5, max: 40})});
        module.emails    = chance.unique(chance.email, seed_data.users)
        for(let i = 0; i < seed_data.users; i++) {
            user_promises.push(db.User.create({username: module.usernames[i], password: module.passwords[i], email: module.emails[i]}));
        }
        return Promise.all(user_promises)
    }).then(() => {

            // b) groups
        console.log("Seeding groups");
        seed_data.groups = chance.integer({min: seed_options.min_groups, max: seed_options.max_groups});
        let group_promises = [];
        module.names = chance.unique(chance.string, seed_data.groups, {length: chance.integer({min: 5, max: 12})});
        for(let i = 0; i < seed_data.groups; i++) {
            group_promises.push(db.Group.create({name: module.names[i]}));
        }
        return Promise.all(group_promises);
    }).then(() => {

            // c) user-group associations
        console.log("Seeding user-group associations")
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
    .then(() => {
        let user = chance.integer({min: 1, max: seed_data.users});
        console.log("Logging in as user", user, "with name", module.usernames[user]);
        return agent.post('/auth/login').send({username: module.usernames[user], password: module.passwords[user]});
    })


}
