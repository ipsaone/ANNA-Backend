'use strict';

const userIsAuthor = async (db, userId) => {
    const user = await db.User.findByPk(userId, {include: ['groups']});

    if (user && user.groups) {

        return Boolean(user.groups
            .map((group) => group.name)
            .find((name) => name === 'authors'));
    }

    return [];

};

exports.filterIndex = async (db, posts, userId) => {

    // Only show drafts if user is an author
    let isAuthor = await userIsAuthor(db, userId);
    if (isAuthor) {
        return posts;
    }

    if (Array.isArray(posts)) {
        return posts.filter((post) => post.published);
    }

    return [];
}


exports.filterShow = async (db, post, userId) =>{
    let isAuthor = await userIsAuthor(db, userId);
    if (post.published || isAuthor) {
        // Only show drafts is user is an author.
        return post;
    }

    return {};
}

    

exports.filterStore = async (db, userId) => {

    // Only allow creation if user is an author.
    let isAuthor = await userIsAuthor(db, userId);

    let user = await db.User.findByPk(userId);
    let isRoot = await user.isRoot();

    return isAuthor || isRoot;
}

exports.filterUpdate = async (db, userId) => {

// Only allow update if user is an author
    let isAuthor = await userIsAuthor(db, userId);
    
    let user = await db.User.findByPk(userId);
    let isRoot = await user.isRoot();

    return isAuthor||isRoot;
}

exports.filterDelete = async (db, userId) => {

    // Only allow delete if user is an author
    let isAuthor = await userIsAuthor(db, userId)
    
    let user = await db.User.findByPk(userId);
    let isRoot = await user.isRoot();

    return isAuthor || isRoot;

}
