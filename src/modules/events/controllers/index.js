'use strict';

module.exports = (db) => ({
    list: require('./list')(db),
    show: require('./show')(db),
    update: require('./update')(db),
    store: require('./store')(db),
    delete: require('./delete')(db),
    addAttendant: require('./addAttendant')(db),
    removeAttendant: require('./removeAttendant')(db)
});

