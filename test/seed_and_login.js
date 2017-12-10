'use strict';

const db = require('../models');
const Chance = require('chance');
const chance = new Chance(Math.random);

const seedOptions = {

    maxGroups: 80,
    maxUsers: 40,
    maxPosts: 40,

    minGroups: 10,
    minUsers: 10,
    minPosts: 10

};

const seedData = {};
const randoms = {};

let myUser = {};
let myUserData = {};

module.exports = (agent) =>

    /* 1. CLEAR */
    db.sequelize.sync({force: true})


    /* 2. SEED */
        .then(() => {

            // A) users
            seedData.users = chance.integer({
                min: seedOptions.minUsers,
                max: seedOptions.maxUsers
            });
            const userPromises = [];

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
            randoms.emails = chance.unique(chance.email, seedData.users);
            for (let i = 0; i < seedData.users; i++) {
                userPromises.push(db.User.create({
                    username: randoms.usernames[i],
                    password: randoms.passwords[i],
                    email: randoms.emails[i]
                }));
            }

            myUser = chance.integer({
                min: 1,
                max: seedData.users - 1
            });
            myUserData = {
                username: randoms.usernames[myUser],
                password: randoms.passwords[myUser]
            };

            return Promise.all(userPromises)
                .then(() => db.User.find({where: {username: myUserData.username}}))
                .then((user) => {
                    if (!user) {
                        console.log(myUserData, myUser);
                    }

                    myUserData.id = user.id;

                    return true;
                });
        })
        .then(() => {

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
        })
        .then(() => {

            // C) user-group associations
            seedData.userGroups = chance.integer({
                min: 1,
                max: Math.min(seedData.users, seedData.groups)
            });
            const userGroupPromises = [];
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
        })
        .then(() => {

            // D) posts
            seedData.posts = chance.integer({
                min: seedOptions.minPosts,
                max: seedOptions.maxPosts
            });

            const postPromises = [];

            randoms.postTitles = chance.unique(chance.string, seedData.posts, {
                length: chance.integer({
                    min: 5,
                    max: 40
                })
            });
            randoms.postContents = chance.unique(chance.string, seedData.posts, {
                min: 20,
                max: 500
            });
            randoms.postAuthorIds = chance.n(chance.integer, seedData.posts, {
                min: 1,
                max: seedData.users
            });
            randoms.postPublished = chance.n(chance.bool, seedData.posts);

            for (let i = 0; i < seedData.userGroups; i++) {
                postPromises.push(db.Post.create({
                    published: randoms.postPublished[i],
                    title: randoms.postTitles[i],
                    markdown: randoms.postContents[i],
                    authorId: randoms.postAuthorIds[i]
                }));
            }

            // Create one draft and one published post for my user
            postPromises.push(db.Post.create({
                title: chance.string({
                    min: 5,
                    max: 40
                }),
                markdown: chance.string({
                    min: 20,
                    max: 500
                }),
                authorId: myUserData.id,
                published: true
            }));
            postPromises.push(db.Post.create({
                title: chance.string({
                    min: 5,
                    max: 40
                }),
                markdown: chance.string({
                    min: 20,
                    max: 500
                }),
                authorId: myUserData.id,
                published: false
            }));

            return Promise.all(postPromises);
        })


    /* 3. LOGIN */
        .then(() => new Promise((resolve) => setTimeout(resolve, 5000)))
        .then(() =>
            agent
                .post('/auth/login')
                .send(myUserData)
                .then(() => myUserData));


