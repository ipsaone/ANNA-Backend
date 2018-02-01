'use strict';

module.exports = (db) => ({
    index: require('./list')(db),
    show: require('./show')(db),
    store: require('./store')(db),
    update: require('./update')(db),
    delete: require('./delete')(db),
    posts: require('./posts.js')(db),
    getGroups: require('./groups/list')(db),
    addGroups: require('./groups/store')(db),
    deleteGroups: require('./groups/delete')(db)
});

