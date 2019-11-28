'use strict';

module.exports = (db) => ({
    download: require('./download')(db),
    getMeta: require('./getMeta')(db),
    uploadRev: require('./uploadRev')(db),
    uploadNew: require('./uploadNew')(db),
    search: require('./search')(db),
    list: require('./list')(db),
    delete: require('./delete')(db)
});

