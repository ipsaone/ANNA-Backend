'use strict';

module.exports = {
    up: (queryInterface) => queryInterface.bulkInsert('Files', [
        {
            isDir: true,
            createdAt: new Date(Date.now()),
            updatedAt: new Date(Date.now())
        }
    ])
        .then(() => queryInterface.bulkInsert('Rights', [
            {
                groupWrite: true,
                groupRead: true,
                ownerWrite: true,
                ownerRead: true,
                allWrite: true,
                allRead: true
            }
        ]))
        .then(() => queryInterface.bulkInsert('Data', [
            {
                name: 'root',
                size: 0,
                type: '',
                fileId: 1,
                dirId: 1,
                ownerId: 1,
                groupId: 1,
                rightsId: 1,
                createdAt: new Date(Date.now()),
                updatedAt: new Date(Date.now())
            }
        ])),

    down: (queryInterface) => queryInterface.bulkDelete('Users', null, {})
};
