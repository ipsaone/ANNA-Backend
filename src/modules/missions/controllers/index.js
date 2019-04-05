'use strict';

module.exports = (db) => ({
    index: require('./list')(db),
    show: require('./show')(db),
    store: require('./store')(db),
    update: require('./update')(db),
    delete: require('./delete')(db),

    indexTasks: require('./task/list')(db),
    showTask: require('./task/show')(db),
    updateTask: require('./task/update')(db),
    storeTask: require('./task/store')(db),
    deleteTask: require('./task/delete')(db),

    storeMember: require('./member/store')(db),
    deleteMember: require('./member/delete')(db)
});


