'use strict';

const chai = require('chai');
const db = require('../models');
const server = require('../app');
const expect = chai.expect;

chai.use(require('chai-http'));

describe('Posts', () => {
    before(() => {
        return db.sequelize.sync().then(() =>
            db.Post.create({title: 'Foo', markdown: 'Bar', authorId: 1, published: true})
        ).then(() => {
            db.Post.create({title: 'Bar', markdown: 'Foo', authorId: 1, published: false});
        })


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
        it('expect POST to return the new post with status 201', done => {
            chai.request(server)
                .post('/posts')
                .send({id: 3, title: 'Lorem ipsum', markdown: 'Lorem ipsum', authorId: 1, published: true})
                .end((err, res) => {
                    expect(err).to.be.null;

                    expect(res).to.have.status(201);
                    expect(res).to.be.json;

                    expect(res.body.id);
                    expect(res.body.title).to.be.equal('Lorem ipsum');
                    expect(res.body.markdown).to.be.equal('Lorem ipsum');
                    expect(res.body.content.replace(/\r?\n?/g, '')).to.be.equal('<p>Lorem ipsum</p>');

                    done();
                });
        });

        it('expect the new post to exist in the database', done => {
            db.Post.findById(3)
                .then(post => {
                    expect(post.id).to.be.equal(3);
                    expect(post.title).to.be.equal('Lorem ipsum');
                    expect(post.markdown).to.be.equal('Lorem ipsum');
                    expect(post.content.replace(/\r?\n?/g, '')).to.be.equal('<p>Lorem ipsum</p>');
                    expect(post.published).to.be.true;
                    expect(post.publishedAt).to.not.be.null;
                    expect(post.createdAt).to.not.be.null;
                    expect(post.updatedAt).to.not.be.null;

                    done();
                });
        });

        it('expect POST post to return an error with status 400 when sending an incomplete request', done => {
            chai.request(server)
                .post('/posts')
                .send({id: 3, markdown: 'Lorem ipsum', authorId: 1, published: true}) // forgot the title
                .end((err, res) => {
                    expect(err).to.not.be.null;
                    expect(res).to.have.status(400);

                    done();
                });
        });
    });

// [PUT] /posts/:id
    describe('[PUT] /posts/:id', () => {
        it('expect PUT to update the post with id = 3 and return nothing with status 204', done => {
            chai.request(server)
                .put('/posts/3')
                .send({title: 'Edited title', published: false})
                .end((err, res) => {
                    expect(err).to.be.null;

                    expect(res).to.have.status(204);
                    expect(res.body).to.be.empty;

                    done();
                });
        });

        it('expect the data to be updated in the database', done => {
            db.Post.findById(3)
                .then(post => {
                    expect(post.title).to.be.equal('Edited title');
                    expect(post.published).to.be.false;
                    expect(post.publishedAt).to.be.null;
                    expect(post.updatedAt).to.not.be.equal(post.createdAt);

                    done();
                });
        });

        it('expect PUT to return an error with the status 400 when sending an incomplete request', done => {
            chai.request(server)
                .put('/posts/3')
                .send({title: null})
                .end((err, res) => {
                    expect(err).to.not.be.null;
                    expect(res).to.have.status(400);

                    done();
                });
        });
    });

// [DELETE] /posts/:id
    describe('[DELETE] /posts/:id', () => {
        it('expect to DELETE the post with id = 3 and return nothing with status 204', done => {
            chai.request(server)
                .delete('/posts/3')
                .end((err, res) => {
                    expect(err).to.be.null;

                    expect(res).to.have.status(204);
                    expect(res.body).to.be.empty;

                    done();
                });
        });

        it('expect to not have the post in the database', done => {
            db.User.findById(3)
                .then(post => {
                    expect(post).to.be.null;

                    done();
                })
                .catch(err => {
                    expect(err).to.not.be.null;

                    done();
                });
        });
    });
});
