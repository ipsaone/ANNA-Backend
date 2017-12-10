'use strict';

const chai = require('chai');
const db = require('../models');
const server = require('../app');
const expect = chai.expect;
const seedAndLogin = require('./seed_and_login');

chai.use(require('chai-http'));
const agent = chai.request.agent(server);

let userInfo = {};

describe('Posts', () => {
    before(() =>
        seedAndLogin(agent)
            .then((userData) => {
                const promises = [];

                promises.push(db.Group.create({name: 'authors'})
                    .then((group) => db.User.find({where: {username: userData.username}})
                        .then((user) => {
                            userInfo = user;

                            return user.addGroup(group.id);
                        })));

                return Promise.all(promises);
            }));

    describe('[GET]', () => {
        it('expect to GET all posts', () =>
            agent.get('/posts')
                .then((res) => {
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;

                    return true;
                }));

        it('expect to GET all published posts', () =>
            agent.get('/posts?published=true')
                .then((res) => {
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;

                    expect(res.body[0].published).to.be.true;
                    expect(res.body[0].publishedAt).to.be.equal(res.body[0].createdAt);

                    return true;
                }));

        it('expect to GET all drafted posts', () =>
            agent.get('/posts?published=false')
                .then((res) => {
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;

                    expect(res.body).to.exist;
                    expect(res.body[0].published).to.be.false;
                    expect(res.body[0].publishedAt).to.be.null;

                    return true;
                }));

        it('expect to GET post with id = 1', () =>
            agent.get('/posts/1')
                .then((res) => {
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;

                    expect(res.body.id).to.be.equal(1);
                    expect(res.body.author).to.not.be.empty;
                    if (res.body.published) {
                        expect(res.body.publishedAt).to.be.equal(res.body.createdAt);
                    }

                    return true;
                }));

        it('expect an error when GET post with id = 3', () =>
            agent.get('/posts/3')
                .then((data) => {
                    expect(data).to.be.null;

                    return true;
                })
                .catch((err) => {
                    expect(err).to.have.status(404);

                    return true;
                }));
    });

    describe('[POST]', () => {
        it('expect POST to return the new post with status 201', () =>
            agent.post('/posts')
                .send({
                    title: 'Lorem ipsum',
                    markdown: 'Lorem ipsum',
                    authorId: userInfo.id,
                    published: true
                })
                .then((res) => {
                    expect(res).to.have.status(201);
                    expect(res).to.be.json;

                    expect(res.body.id).to.exist;
                    expect(res.body.title).to.be.equal('Lorem ipsum');
                    expect(res.body.markdown).to.be.equal('Lorem ipsum');
                    expect(res.body.content.replace(/\r?\n?/g, '')).to.be.equal('<p>Lorem ipsum</p>');

                    it('expect the new post to exist in the database', () =>
                        agent.get(`/posts/${res.body.id}`)
                            .then((post) => {
                                expect(post.id).to.be.equal(res.body.id);
                                expect(post.title).to.be.equal('Lorem ipsum');
                                expect(post.markdown).to.be.equal('Lorem ipsum');
                                expect(post.content.replace(/\r?\n?/g, '')).to.be.equal('<p>Lorem ipsum</p>');
                                expect(post.published).to.be.true;
                                expect(post.publishedAt).to.not.be.null;
                                expect(post.createdAt).to.not.be.null;
                                expect(post.updatedAt).to.not.be.null;

                                return true;
                            }));

                    return true;
                }));


        it('expect POST post to return an error with status 400 when sending an incomplete request', () =>
            agent.post('/posts')
                .send({
                    id: 3,
                    markdown: 'Lorem ipsum',
                    authorId: userInfo.id,
                    published: true
                }) // Forgot the title
                .catch((err) => {
                    expect(err).to.have.status(400);

                    return true;
                }));

    });

    describe('[PUT]', () => {
        it('expect PUT to update the post with id = 3 and return nothing with status 204', () =>
            chai.request(server).put('/posts/3')
                .send({
                    title: 'Edited title',
                    published: false
                })
                .then((res) => {
                    expect(res).to.have.status(204);
                    expect(res.body).to.be.empty;

                    it('expect the data to be updated in the database', () =>
                        db.Post.findById(3)
                            .then((post) => {
                                expect(post.title).to.be.equal('Edited title');
                                expect(post.published).to.be.false;
                                expect(post.updatedAt).to.not.be.equal(post.createdAt);

                                return true;
                            }));

                    return true;
                }));


        it('expect PUT to return an error with the status 400 when sending an incomplete request', () =>
            agent.put('/posts/3')
                .send({title: null})
                .catch((err) => {
                    expect(err).to.have.status(400);

                    return true;
                }));
    });

    describe('[DELETE]', () => {
        it('expect to DELETE the post with id = 2 and return nothing with status 204', () =>
            agent.delete('/posts/2')
                .then((res) => {
                    expect(res).to.have.status(204);
                    expect(res.body).to.be.empty;

                    it('expect to not have the post in the database', () =>
                        db.User.findById(2)
                            .then((post) => {
                                expect(post).to.be.null;

                                return true;
                            }));

                    return true;
                }));


    });

});
