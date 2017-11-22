'use strict';

const chai = require('chai');
const db = require('../models');
const server = require('../app');
const expect = chai.expect;
const seed_and_login = require('./seed_and_login');

chai.use(require('chai-http'));
const agent = chai.request.agent(server);

describe('Posts', () => {
    before(() =>
        seed_and_login(agent).
            then((user) => {
                db.Group.create({name: 'authors'});
                db.Post.create({
                    title: 'Foo',
                    markdown: 'Bar',
                    authorId: 1,
                    published: true
                });
                db.Post.create({
                    title: 'Bar',
                    markdown: 'Foo',
                    authorId: 1,
                    published: false
                });
            }));


    it('expect to GET all posts', () =>
        agent.get('/posts').
            then((res) => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body.length).to.be.equal(2);
            }));


    it('expect to GET all published posts', () =>
        agent.get('/posts?published=true').
            then((res) => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body.length).to.be.equal(1);

                expect(res.body[0].id).to.be.equal(1);
                expect(res.body[0].title).to.be.equal('Foo');
                expect(res.body[0].markdown).to.be.equal('Bar');
                expect(res.body[0].content.replace(/\r?\n?/g, '')).to.be.equal('<p>Bar</p>');
                expect(res.body[0].authorId).to.be.equal(1);
                expect(res.body[0].published).to.be.true;
                expect(res.body[0].publishedAt).to.be.equal(res.body[0].createdAt);
            }));

    it('expect to GET all drafted posts', () =>
        agent.get('/posts?published=false').
            then((res) => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body.length).to.be.equal(1);

                expect(res.body[0].id).to.be.equal(2);
                expect(res.body[0].title).to.be.equal('Bar');
                expect(res.body[0].markdown).to.be.equal('Foo');
                expect(res.body[0].content.replace(/\r?\n?/g, '')).to.be.equal('<p>Foo</p>');
                expect(res.body[0].authorId).to.be.equal(1);
                expect(res.body[0].published).to.be.false;
                expect(res.body[0].publishedAt).to.be.null;

            }));


    it('expect to GET post with id = 1', () =>
        agent.get('/posts/1').
            then((res) => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;

                expect(res.body.id).to.be.equal(1);
                expect(res.body.title).to.be.equal('Foo');
                expect(res.body.markdown).to.be.equal('Bar');
                expect(res.body.content.replace(/\r?\n?/g, '')).to.be.equal('<p>Bar</p>');
                expect(res.body.authorId).to.be.equal(1);
                expect(res.body.published).to.be.true;
                expect(res.body.author).to.not.be.empty;
                expect(res.body.publishedAt).to.be.equal(res.body.createdAt);

            }));

    it('expect an error when GET post with id = 3', () =>
        agent.get('/posts/3').
            then((res) => {
                expect(res).to.have.status(404);

            }));


    it('expect POST to return the new post with status 201', () =>
        agent.post('/posts').
            send({
                id: 3,
                title: 'Lorem ipsum',
                markdown: 'Lorem ipsum',
                authorId: 1,
                published: true
            }).
            then((res) => {
                expect(res).to.have.status(201);
                expect(res).to.be.json;

                expect(res.body.id);
                expect(res.body.title).to.be.equal('Lorem ipsum');
                expect(res.body.markdown).to.be.equal('Lorem ipsum');
                expect(res.body.content.replace(/\r?\n?/g, '')).to.be.equal('<p>Lorem ipsum</p>');

            }));

    it('expect the new post to exist in the database', () =>
        agent.then((post) => {
            expect(post.id).to.be.equal(3);
            expect(post.title).to.be.equal('Lorem ipsum');
            expect(post.markdown).to.be.equal('Lorem ipsum');
            expect(post.content.replace(/\r?\n?/g, '')).to.be.equal('<p>Lorem ipsum</p>');
            expect(post.published).to.be.true;
            expect(post.publishedAt).to.not.be.null;
            expect(post.createdAt).to.not.be.null;
            expect(post.updatedAt).to.not.be.null;

        }));

    it('expect POST post to return an error with status 400 when sending an incomplete request', () =>
        agent.post('/posts').
            send({
                id: 3,
                markdown: 'Lorem ipsum',
                authorId: 1,
                published: true
            }). // Forgot the title
            then((res) => {
                expect(res).to.have.status(400);

            }));

    it('expect PUT to update the post with id = 3 and return nothing with status 204', () =>
        chai.request(server).
            put('/posts/3').
            send({
                title: 'Edited title',
                published: false
            }).
            then((res) => {
                expect(res).to.have.status(204);
                expect(res.body).to.be.empty;

            }));

    it('expect the data to be updated in the database', () =>
        db.Post.findById(3).
            then((post) => {
                expect(post.title).to.be.equal('Edited title');
                expect(post.published).to.be.false;
                expect(post.publishedAt).to.be.null;
                expect(post.updatedAt).to.not.be.equal(post.createdAt);

            }));

    it('expect PUT to return an error with the status 400 when sending an incomplete request', () =>
        agent.put('/posts/3').
            send({title: null}).
            then((res) => {
                expect(res).to.have.status(400);

            }));

    it('expect to DELETE the post with id = 3 and return nothing with status 204', () =>
        agent.delete('/posts/3').
            then((res) => {
                expect(res).to.have.status(204);
                expect(res.body).to.be.empty;

            }));

    it('expect to not have the post in the database', () =>
        db.User.findById(3).
            then((post) => {
                expect(post).to.be.null;

            }));
});
