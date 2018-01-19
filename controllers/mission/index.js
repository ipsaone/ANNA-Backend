'use strict';

exports.index = require('./list');
exports.show = require('./show');
exports.store = require('./store');
exports.update = require('./update');
exports.delete = require('./delete');

exports.indexTasks = require('./task/list');
exports.showTask = require('./task/show');
exports.updateTask = require('./task/update');
exports.storeTask = require('./task/store');
exports.deleteTask = require('./task/delete');

exports.storeMember = require('./member/store');
exports.deleteMember = require('./member/delete');


