'use strict';

/*
 * This file is an experiment with async/await
 * Do not try this at home
 */

const db = require('../models');

exports.filterList = async (folderId, userId) => {
    // Check if directory has 'read' permission

    /*
     * 1st caveat of async/await: having to regroup
     * concurrent calls under a single await
     */

    const folderP = db.File.findById(folderId);
    const userP = db.User.findById(userId);
    const [
        folder,
        user
    ] = await Promise.all([
        folderP,
        userP
    ]); // First batch

    const folderDataP = folder.getData();
    const userGroupsP = user.getGroups();
    const [
        folderData,
        userGroups
    ] = await Promise.all([
        folderDataP,
        userGroupsP
    ]); // Second batch


    /*
     * 2nd caveat of async/await : knowing when to
     * separate call and resolution
     */

    // Start the research of rights
    const folderRightsP = folderData.getRights();

    // Do other lenghty things
    const userGroupsIds = userGroups.map((group) => group.id);
    const userIsInGroup = userGroupsIds.includes(folderData.groupId);
    const userIsOwner = folderData.ownerId === userId;

    // Stop here and wait to get the rights
    const folderRights = await folderRightsP;


    if (folderRights.allRead === true) {
        // First, check 'all' permission
        return true;
    } else if (userIsInGroup === true && folderRights.groupRead === true) {
        // Then, check group permission, only if user is in the group
        return true;
    } else if (userIsOwner === true && folderRights.ownerRead === true) {
        // Finally, check owner permission, only if user is the owner
        return true;
    }

    // Throw an error if the error isn't authorized

    throw new Error('Unauthorized');


};

exports.filterUploadNew = () => {
    // Check if directory has 'write' permission


};

exports.filterUploadRev = () => {

    /*
     * Check if directory has 'write' permission for metadata update
     * Check if file has 'write' permission for file update
     */
};

exports.filterDownload = () => {
    // Check if file has 'read' permission
};

exports.filterDelete = () => {
    // Check if directory has 'write' permission
};
