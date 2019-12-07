'use strict';

const joi = require('joi');
const policy = require('../user_policy');

const schema = joi.object().keys({
    username: joi.string().min(4).optional(),
    email: joi.string().min(5).optional()
});


async function findInternalFolder(transaction) {
    // TODO : Fix possible bug where '.internal' is the old name of a different folder 
    transaction.logger.info('Finding .internal folder in the root');
    let internalData = await transaction.db.Data.findOne(
        {
            where: {
                [transaction.db.Sequelize.Op.and]: [
                    {name: '.internal'},
                    {dirId: 1}
                ]
            }
        });

    if(!internalData) {
        return;
    }

    let internalFile = await internalData.getFile();

    transaction.logger.debug('Found internal file ID', {internalFile});
    return internalFile.id;
}

async function findProfileFolder(transaction, internalFileId) {
    // TODO : Fix possible bug where 'profiles' is the old name of a different folder 
    let profileData = await transaction.db.Data.findOne(
        {
            where: {
                [transaction.db.Sequelize.Op.and]: [
                    {name: 'profiles'},
                    {dirId: internalFileId}
                ]
            }
        });

    if(!profileData) {
        return;
    }

    let profileFile = await profileData.getFile();
    return profileFile.id;
}

async function createInternalFolder(transaction) {
    transaction.logger.info('Creating .internal folder');
    let internalObj = {
        dirId: 1, 
        groupId: 4, // default
        isDir: true,
        serialNbr: '',
        ownerId: 1, // root
        name: '.internal',
        ownerRead : true,
        ownerWrite: true,
        groupRead: true,
        groupWrite: true,
        allRead: true,
        allWrite: true,
    };

    transaction.logger.debug('Internal object', {internalObj});
    const internalData = await transaction.db.File.createNew(transaction, internalObj);

    const internalFile = await internalData.getFile();
    return internalFile.id;
}

async function createProfileFolder(transaction, internalFileId) {
    transaction.logger.info('Creating profiles folder', {fileId: internalFileId});
    const profileObj = {
        dirId: internalFileId,
        groupId: 4, // default
        isDir: true,
        serialNbr: '',
        ownerId: transaction.info.userId,
        name: 'profiles',
        ownerRead : true,
        ownerWrite: true,
        groupRead: true,
        groupWrite: false,
        allRead: true,
        allWrite: false,
    };

    transaction.logger.debug('Profile object', {profileObj});
    const newProfileData = await transaction.db.File.createNew(transaction, profileObj);

    if(!newProfileData) {
        return;
    }

    let newProfileFile = await newProfileData.getFile();
    return newProfileFile.id;
}

async function uploadNew(transaction, profileFileId) {
    const imageData = await transaction.db.File.createNew(transaction, {
        dirId: profileFileId,
        groupId: 4,
        isDir: false,
        serialNbr: '',
        ownerId: transaction.info.userId,
        name: transaction.info.userId.toString(),
        ownerRead : true,
        ownerWrite: true,
        groupRead: true,
        groupWrite: false,
        allRead: false,
        allWrite: false,
    });

    if(!imageData) {
        transaction.logger.error('Couldn\'t create new file for profile picture');
        return;
    }

    const imageFile = await imageData.getFile();
    return imageFile.id;
}

async function uploadRev(transaction, profileFileId) {
    transaction.logger.info('Creating new revision for profile picture');
    const imageData = await file.addData({
        dirId: profileFileId,
        groupId: 1,
        isDir: false,
        serialNbr: '',
        ownerId: 1,
        name: transaction.info.userId.toString(),
        ownerRead : true,
        ownerWrite: true,
        groupRead: true,
        groupWrite: false,
        allRead: false,
        allWrite: false
    });

    if(!imageData) {
        transaction.logger.error('Couldn\'t create profile picture file revision');
        return;
    }

    const imageFile = await imageData.getFile();
    return imageFile.id;
}


module.exports = (db) => async function (req, res) {
    const userId = parseInt(req.params.userId, 10);

    // Needed because multer just modified it
    req.transaction.reqBody = req.body;
    req.transaction.file = req.file;

    // Validate user input
    req.transaction.logger.info('Validating schema');
    const validation = joi.validate(req.body, schema);
    if (validation.error) {
        req.transaction.logger.info('Schema validation error');
        return res.boom.badRequest(validation.error);
    }

    req.transaction.logger.info('Invoking policies');
    let authorized = policy.filterUpdate(req.transaction, req.params.userId, req.session.auth);
    if(!authorized) {
        req.transaction.logger.info('Policies denied access');
        return res.boom.unauthorized();
    }

    req.transaction.logger.info('Finding user');
    const user = await db.User.findByPk(userId);

    req.transaction.logger.info('Checking picture upload')
    let ProfilePictureFileId = null;
    if (req.file) {
        req.transaction.logger.info('Reading file path');
        req.transaction.filePath = req.file.path;
    
        // FIND PREVIOUS PROFILE PICTURE FILE ID
        req.transaction.logger.info('Finding user profile picture file id');
        let profilePictureFile = await user.getProfilePictureFile();

        if(profilePictureFile) {
            // UPLOAD REVISION
            const imageFileId = uploadRev(req.transaction, profilePictureFile.id);

            if(!imageFileId) {
                req.transaction.logger.error('Couldn\'t create new file for profile picture');
                return res.boom.badImplementation();
            } else if (imageFileId !== profilePictureFile) {
                req.transaction.logger.warn('New file Id for profile picture is different from the previous one');

                // SAVE THE NEW FILE ID FOR LATER LOOKUP
                ProfilePictureFileId = imageFileId;
            }

        } else {
            // FIND THE .INTERNAL FOLDER
            let internalFileId = await findInternalFolder(req.transaction);

            if(!internalFileId) {
                {
                    // CREATE THE .INTERNAL FOLDER
                    const internalFileId = await createInternalFolder(req.transaction);
    
                    if(!internalFileId) {
                        req.transaction.logger.error('Couldn\'t create new .internal folder');
                        return res.boom.badImplementation();
    
                    }
    
                    // CREATE THE PROFILES FOLDER
                    req.transaction.logger.info('Creating profiles folder');
                    const profileFileId = await createProfileFolder(req.transaction, internalFileId);
    
                    if(!profileFileId) {
                        req.transaction.logger.error('Couldn\'t create new profiles folder');
                        return res.boom.badImplementation();
                    }
                    
    
                    // UPLOADNEW
                    const imageFileId = await uploadNew(req.transaction, profileFileId);
    
                    if(!imageFileId) {
                        req.transaction.logger.error('Couldn\'t create new file for profile picture');
                        return res.boom.badImplementation();
                    } 
    
                    // SAVE THE FILE ID FOR LATER LOOKUP
                    ProfilePictureFileId = imageFileId;
    
                }
            } else {
                req.transaction.logger.info('Finding profiles folder');
                // FIND THE PROFILES FOLDER
                let profileFileId = await findProfileFolder(req.transaction, internalFileId);
                
                
                if(!profileFileId) {
                    // CREATE THE PROFILES FOLDER
                    let newProfileFileId = createProfileFolder(req.transaction, internalFileId);

                    if(!newProfileFileId) {
                        req.transaction.logger.error('Couldn\'t create profiles folder');
                        return req.boom.badImplementation();
                    } 

                    // UPLOADNEW
                    const imageFileId = uploadNew(req.transaction, profileFileId);

                    if(!imageFileId) {
                        req.transaction.logger.error('Couldn\'t create new file for profile picture');
                        return res.boom.badImplementation();
                    } 

                    // SAVE THE FILE ID FOR LATER LOOKUP
                    ProfilePictureFileId = imageFileId;
                        


                    
                } else {
                   // UPLOADNEW
                   const imageFileId = uploadNew(req.transaction, profileFileId);

                   if(!imageFileId) {
                    req.transaction.logger.error('Couldn\'t create new file for profile picture');
                    return res.boom.badImplementation();
                } 

                   // SAVE THE FILE ID FOR LATER LOOKUP
                   ProfilePictureFileId = imageFileId;
                }
                    

                    
            }
        }
    }

    req.transaction.logger.info('Updating user');
    await user.update(req.body);

    req.transaction.logger.info('Sending updated user');
    return res.status(200).json({id: user.id});
};
