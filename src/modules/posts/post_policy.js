'use strict';

const userIsAuthor = async (transaction, userId) => {

    transaction.logger.debug('Finding user to check if author');
    const user = await transaction.db.User.findByPk(userId, {include: ['groups']});

    transaction.logger.debug('Groups found, looking for "authors"');
    return Boolean(user.groups
            .map((group) => group.name)
            .find((name) => name === 'authors'));
};


exports.filterIndex = async (transaction, posts, userId) => {

    // Only show drafts if user is an author
    transaction.logger.info('Checking if user is author');
    let isAuthor = await userIsAuthor(transaction, userId);
    let user = await transaction.db.User.findByPk(userId);
    transaction.logger.debug('Check results', {isAuthor});
    if (isAuthor || await user.isRoot()) {
        transaction.logger.info('User is author, returning all posts');
        transaction.logger.debug('No posts filtered', {posts});
        return posts;
    }

    transaction.logger.info('User is not author, filtering');
    if (Array.isArray(posts)) {

        let filtered = posts.filter((post) => post.published);
        transaction.logger.debug('Filtered posts', {filtered});
        return filtered;
    }

    return [];
}

exports.filterShow = async (transaction, post, userId) =>{
   
    if (post.published || transaction.info.isAuthorized) {
        // Only show drafts is user is an author.
        transaction.logger.info('User is author or post is published, returning post') ;
        return post;
    }

    transaction.logger.info('User is not author or post is not published');
    return {};
}
