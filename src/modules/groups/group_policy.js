'use strict';

exports.filterList = async (transaction) => true;

exports.filterShow = async (transaction) => true;

exports.filterStore = async (transaction) => true;

exports.filterUpdate = async (transaction) => true;

exports.filterDelete = async (transaction, group) => {
    let cannotDelete = ['root', 'authors', 'organizers', 'default'] // TODO : put this in config file
    if(cannotDelete.includes(group.name)) {
        return false;
    }

    return true;
};