'use strict';

const path = require('path');

class Storage {
    static get root() {
        return path.join(__dirname, '..', 'storage');
    }


}

// TESTS
console.log(Storage.root);