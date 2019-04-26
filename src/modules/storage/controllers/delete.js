'use strict';

const policy = require('../storage_policy');
const winston = require('winston');



module.exports = (db) => async (req, res) => {
    const fileId = parseInt(req.params.fileId, 10);

    req.transaction.logger.debug('Checking policy');
    const authorized = await policy.filterDelete(req.transaction, fileId, req.session.auth);
    if (!authorized) {
        req.transaction.logger.info('Deletion refused by policy');
        throw res.boom.unauthorized();
    }

    req.transaction.logger.info('Destroying data', {fileId: fileId});
    await db.Data.destroy({where: {fileId: fileId}});

    req.transaction.logger.debug('Returning 204');
    return res.status(204).send();
};

test.todo('Delete file');
test('Delete folder', async t => {
    let res = await t.context.request.post('/storage/upload')
        .field('isDir', true)
        .field('name', 'test')
        .field('dirId', t.context.folder.id)
        .field('groupId', t.context.group.id)
        .field('ownerRead', true)
        .field('groupRead', true)
        .field('allRead', true)

    t.is(res.status, 200);

    let res88 = await t.context.request.get('/storage/files/list/'+t.context.folder.id);
    t.is(res88.body.children.length, 1);


    let res2 = await t.context.request.delete('/storage/files/'+res.body.id);
    t.is(res2.status, 204);

    let res_2 = await t.context.request.get('/storage/files/list/'+t.context.folder.id);
    t.is(res_2.body.children.length, 0)
});