'use strict';

exports.filterList = async () => true;

exports.filterShow = async () => true;

exports.filterStore = async () => true;

exports.filterUpdate = async () => true;

exports.filterDelete = async (transaction, group) => {
    let cannotDelete = ['root', 'authors', 'organizers', 'default'] // TODO : put this in config file
    if(cannotDelete.map(el => el.toLowerCase()).includes(group.name)) {
        return false;
    }

    return true;
};