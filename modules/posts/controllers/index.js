'use strict';

module.exports = (db) => ({
    index: require('./list')(db),
    show: require('./show')(db),
    store: require('./store')(db),
    update: require('./update')(db),
    delete: require('./delete')(db)

});
