'use strict';

module.exports = (db) => ({
    index: require('./list')(db),
    show: require('./show')(db),
    store: require('./store')(db),
    update: require('./update')(db),
    delete: require('./delete')(db),
    posts: require('./posts.js')(db),
    getGroups: require('./groups/list')(db),
    addGroup: require('./groups/store')(db),
    deleteGroup: require('./groups/delete')(db)
});

