'use strict';

const chai = require('chai');
const db = require('../models');
const server = require('../app');
const expect = chai.expect;

chai.use(require('chai-http'));

describe('Posts', () => {
    before(() => {
        db.Post.destroy({where: {}});
        db.Post.create({id: 1, title: 'Foo', markdown: 'Bar', authorId: 1, published: true});
        db.Post.create({id: 2, title: 'Bar', markdown: 'Foo', authorId: 1, published: false});
    });


// [GET] /posts
    describe('[GET] /posts', () => {
        it('expect to GET all posts', done => {
            chai.request(server)
                .get('/posts')
                .end((err, res) => {
                    expect(err).to.be.null;

                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                    expect(res.body.length).to.be.equal(2);

                    done();
                });
        });
    });


// [GET] /posts?published=:bool
    describe('[GET] /posts?published=:bool', () => {
        it('expect to GET all published posts', done => {
            chai.request(server)
                .get('/posts?published=true')
                .end((err, res) => {
                    expect(err).to.be.null;

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

                    done();
                });
        });

        it('expect to GET all drafted posts', done => {
            chai.request(server)
                .get('/posts?published=false')
                .end((err, res) => {
                    expect(err).to.be.null;

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

                    done();
                });
        });
    });


// [GET] /posts/:id
    describe('[GET] /posts/:id', () => {
        it('expect to GET post with id = 1', done => {
            chai.request(server)
                .get('/posts/1')
                .end((err, res) => {
                    expect(err).to.be.null;

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

                    done();
                });
        });

        it('expect an error when GET post with id = 3', done => {
            chai.request(server)
                .get('/posts/3')
                .end((err, res) => {
                    expect(err).to.not.be.null;
                    expect(res).to.have.status(404);

                    done();
                });
        });
    });


// [POST] /posts
    describe('[POST] /posts', () => {
        it('expect ', done => {
            done();
        });
    })
});