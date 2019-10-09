'use strict';

exports.filterIndex = async (transaction, posts, userId) => {

    if(transaction.info.isAuthorized) {
        return posts;
    }

    transaction.logger.info('User is not in authorized group, filtering');
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
