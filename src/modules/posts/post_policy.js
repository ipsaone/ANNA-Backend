'use strict';

const userIsAuthor = async (transaction, userId) => {

    transaction.logger.debug('Finding user to check if author');
    const user = await transaction.db.User.findByPk(userId, {include: ['groups']});

    if (user && user.groups) {


    transaction.logger.debug('Groups found, looking for "authors"');
    return Boolean(user.groups
            .map((group) => group.name)
            .find((name) => name === 'authors'));
    }

    return [];

};

exports.filterIndex = async (transaction, posts, userId) => {

    // Only show drafts if user is an author
    transaction.logger.info('Checking if user is author');
    let isAuthor = await userIsAuthor(transaction, userId);
    if (isAuthor) {
        transaction.logger.info('User is author, returning all posts');
        return posts;
    }

    if (Array.isArray(posts)) {

        return posts.filter((post) => post.published);
    }

    return [];
}

exports.filterShow = async (transaction, post, userId) =>{
    let isAuthor = await userIsAuthor(transaction, userId);
    if (post.published || isAuthor) {
        // Only show drafts is user is an author.
        transaction.logger.info('User is author or post is published, returning post') ;
        return post;
    }

    transaction.logger.info('User is not author or post is not published');
    return {};
}



exports.filterStore = async (transaction, userId) => {

    // Only allow creation if user is an author.
    transaction.logger.info('Checking if user is author');
    let isAuthor = await userIsAuthor(transaction, userId);
    if(isAuthor) { return true; }

    transaction.logger.info('User is not author, checking if root');
    let user = await transaction.db.User.findByPk(userId);
    let isRoot = await user.isRoot();

    return isRoot;
}

exports.filterUpdate = async (transaction, userId) => {

    // Only allow update if user is an author
    transaction.logger.info('Checking if user is author');
    let isAuthor = await userIsAuthor(transaction, userId);
    if(isAuthor) { return true; }

    transaction.logger.info('User is not author, checking if root');
    let user = await db.User.findByPk(userId);
    let isRoot = await user.isRoot();

    return isRoot;
}

exports.filterDelete = async (transaction, userId) => {

    // Only allow delete if user is an author
    transaction.logger.info('Checking if user is author');
    let isAuthor = await userIsAuthor(transaction, userId)
    if(isAuthor) { return true; }

    transaction.logger.info('User is not author, checking if root');
    let user = await db.User.findByPk(userId);
    let isRoot = await user.isRoot();

    return isRoot;

}
