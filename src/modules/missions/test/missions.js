'use strict'

process.env.TEST = true;

const test = require('ava');

const findRoot =  require('find-root');
const root = findRoot(__dirname);
const {join} = require('path');
const chance = require('chance').Chance();


const fs = require('fs');


test.beforeEach(async t => {
    const loadApp = require(join(root, 'src', './app'));
    let {app, modules} = loadApp({test: true, noLog: true});
    const request = require('supertest').agent(app);

    const db = await modules.syncDB();

    t.context.app = app;
    t.context.db = db;
    t.context.request = request;


    t.context.user = await db.User.create({
        username: 'login_test',
        password: 'password_test',
        email: 'test@test.com'
    });

    t.context.user2 = await db.User.create({
      username: 'login_test2',
      password: 'password_test2',
      email: 'test2@test.com'
    })

    let res = await request.post('/auth/login').send({
        username: 'login_test',
        password: 'password_test'
    });
    t.is(res.status, 200);

    t.context.group = await db.Group.create({
        name: "root"
    });

});


test('Create mission (multiple scenarios)', async t => {
    // ROOT
    {
        await t.context.user.addGroup(t.context.group);
        let res = await t.context.request.post('/missions')
            .send({
                name: "test",
                markdown: "# TEST",
                budgetAssigned: 100,
                budgetUsed: 40,
                groupId: t.context.group.id,
                leaderId: t.context.user.id
            });

        t.is(res.status, 200);
        t.is(res.body.name, 'test');
        t.is(res.body.description.startsWith('<h1 id="test">TEST</h1>'), true);
    }

    // NO GROUP
    {
        await t.context.user.setGroups([]);
        let res = await t.context.request.post('/missions')
            .send({
                name: "test",
                markdown: "# TEST",
                budgetAssigned: 100,
                budgetUsed: 40,
                groupId: t.context.group.id,
                leaderId: t.context.user.id
            });

        t.is(res.status, 401);
    }

    // NO NAME FOR MISSION
    {
        await t.context.user.addGroup(t.context.group);
        let res = await t.context.request.post('/missions')
            .send({
                name: "",
                markdown: "# TEST",
                budgetAssigned: 100,
                budgetUsed: 40,
                groupId: t.context.group.id,
                leaderId: t.context.user.id
            });

        t.is(res.status, 400);
    }

    // BLANK NAME FOR MISSION
    {
        await t.context.user.addGroup(t.context.group);
        let res = await t.context.request.post('/missions')
            .send({
                name: "     ",
                markdown: "# TEST",
                budgetAssigned: 100,
                budgetUsed: 40,
                groupId: t.context.group.id,
                leaderId: t.context.user.id
            });

        t.is(res.status, 400);
    }

    // NO MARKDOWN FOR MISSION
    {
        await t.context.user.addGroup(t.context.group);
        let res = await t.context.request.post('/missions')
            .send({
                name: "name",
                markdown: "",
                budgetAssigned: 100,
                budgetUsed: 40,
                groupId: t.context.group.id,
                leaderId: t.context.user.id
            });

        t.is(res.status, 400);
    }

    // NEGATIVE BUDGETASSIGNED
    {
        await t.context.user.addGroup(t.context.group);
        let res = await t.context.request.post('/missions')
            .send({
                name: "name",
                markdown: "#test",
                budgetAssigned: -3100,
                budgetUsed: 40,
                groupId: t.context.group.id,
                leaderId: t.context.user.id
            });

        t.is(res.status, 400);
    }

    // NEGATIVE BUDGETUSED
    {
        await t.context.user.addGroup(t.context.group);
        let res = await t.context.request.post('/missions')
            .send({
                name: "name",
                markdown: "#test",
                budgetAssigned: 3100,
                budgetUsed: -40,
                groupId: t.context.group.id,
                leaderId: t.context.user.id
            });

        t.is(res.status, 400);
    }

    // ZERO BUDGETUSED
    {
            await t.context.user.addGroup(t.context.group);
            let res = await t.context.request.post('/missions')
            .send({
                name: "name",
                markdown: "#test",
                budgetAssigned: 3100,
                budgetUsed: 0,
                groupId: t.context.group.id,
                leaderId: t.context.user.id
            });

        t.is(res.status, 200);
        t.is(res.body.name, 'name');
    }

    // ZERO BUDGETS
    {
        await t.context.user.addGroup(t.context.group);
        let res = await t.context.request.post('/missions')
            .send({
                name: "name",
                markdown: "#test",
                budgetAssigned: 0,
                budgetUsed: 0,
                groupId: t.context.group.id,
                leaderId: t.context.user.id
            });

        t.is(res.status, 200);
        t.is(res.body.name, 'name');
    }
});

test('Edit mission (multiple scenarios)', async t => {
    // ROOT
    {
        await t.context.user.addGroup(t.context.group);
        let res = await t.context.request.post('/missions')
            .send({
                name: "test",
                markdown: "# TEST",
                budgetAssigned: 100,
                budgetUsed: 40,
                groupId: t.context.group.id,
                leaderId: t.context.user.id
            });

        t.is(res.status, 200);

        let res2 = await t.context.request.put('/missions/'+res.body.id)
            .send({
                name: "testEdited"
            });

        t.is(res2.status, 200);
        t.is(res2.body.name, 'testEdited');
    }

    // NO NAME
    {
        await t.context.user.addGroup(t.context.group);
        let mission = await t.context.db.Mission.create({
            name: "name",
            markdown: "# TEST",
            budgetAssigned: 100,
            budgetUsed: 40,
            groupId: t.context.group.id,
            leaderId: t.context.user.id
        });

        let res2 = await t.context.request.put('/missions/'+mission.id)
            .send({
                name: "  "
            });

        t.is(res2.status, 400);
    }

    // NO GROUP & NO LEADER
    {
        await t.context.user.setGroups([]);
        let mission = await t.context.db.Mission.create({
            name: "test",
            markdown: "# TEST",
            budgetAssigned: 100,
            budgetUsed: 40,
            groupId: t.context.group.id,
            leaderId: t.context.user2.id
        });

        let res2 = await t.context.request.put('/missions/'+mission.id)
            .send({
                name: "testEdited"
            });

        t.is(res2.status, 401);
    }

    // NO MARKDOWN
    {
        await t.context.user.addGroup(t.context.group);
        let res = await t.context.request.post('/missions')
            .send({
                name: "test",
                markdown: "# TEST",
                budgetAssigned: 100,
                budgetUsed: 40,
                groupId: t.context.group.id,
                leaderId: t.context.user.id
            });

        t.is(res.status, 200);

        let res2 = await t.context.request.put('/missions/'+res.body.id)
            .send({
                name: "testEdited",
                markdown: " ",
                budgetAssigned: 100,
                budgetUsed: 40,
                groupId: t.context.group.id,
                leaderId: t.context.user.id
            });

        t.is(res2.status, 400);
    }

    // NEGATIVE BUDGETASSIGNED
    {
        await t.context.user.addGroup(t.context.group);
        let res = await t.context.request.post('/missions')
            .send({
                name: "test",
                markdown: "# TEST",
                budgetAssigned: 100,
                budgetUsed: 40,
                groupId: t.context.group.id,
                leaderId: t.context.user.id
            });

        t.is(res.status, 200);

        let res2 = await t.context.request.put('/missions/'+res.body.id)
            .send({
                name: "testEdited",
                markdown: "# TEST",
                budgetAssigned: -100,
                budgetUsed: 40,
                groupId: t.context.group.id,
                leaderId: t.context.user.id
            });

        t.is(res2.status, 400);
    }
    
    // NEGATIVE BUDGETUSED
    {
        await t.context.user.addGroup(t.context.group);
        let res = await t.context.request.post('/missions')
            .send({
                name: "test",
                markdown: "# TEST",
                budgetAssigned: 100,
                budgetUsed: 40,
                groupId: t.context.group.id,
                leaderId: t.context.user.id
            });

        t.is(res.status, 200);

        let res2 = await t.context.request.put('/missions/'+res.body.id)
            .send({
                name: "testEdited",
                markdown: "# TEST",
                budgetAssigned: 100,
                budgetUsed: -40,
                groupId: t.context.group.id,
                leaderId: t.context.user.id
            });

        t.is(res2.status, 400);
    }
})

test('List missions', async t => {
    await t.context.user.addGroup(t.context.group);
    await t.context.request.post('/missions')
        .send({
            name: "test",
            markdown: "# TEST",
            budgetAssigned: 100,
            budgetUsed: 40,
            groupId: t.context.group.id,
            leaderId: t.context.user.id
        });

    await t.context.request.post('/missions')
        .send({
            name: "test2",
            markdown: "# TEST2",
            budgetAssigned: 100,
            budgetUsed: 40,
            groupId: t.context.group.id,
            leaderId: t.context.user.id
        });

    let res = await t.context.request.get('/missions');
    t.is(res.status, 200);
    t.is(res.body.length, 2);
    t.is(res.body[0].name, 'test');
    t.is(res.body[1].name, 'test2');
});

test('Mission details', async t => {
    await t.context.user.addGroup(t.context.group);
    let res = await t.context.request.post('/missions')
        .send({
            name: "test",
            markdown: "# TEST",
            budgetAssigned: 100,
            budgetUsed: 40,
            groupId: t.context.group.id,
            leaderId: t.context.user.id
        });
    t.is(res.status, 200);

    let res2 = await t.context.request.get('/missions/'+res.body.id);
    t.is(res2.status, 200);
    t.is(res2.body.name, 'test');
});

test('Delete mission', async t => {
    await t.context.user.addGroup(t.context.group);
    let res = await t.context.request.post('/missions')
        .send({
            name: "test",
            markdown: "# TEST",
            budgetAssigned: 100,
            budgetUsed: 40,
            groupId: t.context.group.id,
            leaderId: t.context.user.id
        });

    t.is(res.status, 200);

    let res2 = await t.context.request.delete('/missions/'+res.body.id);
    t.is(res2.status, 204);

    let res3 = await t.context.db.Mission.findAll();
    t.is(res3.length, 0);
});
