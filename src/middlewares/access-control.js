const findRoot = require('find-root');
const path = require('path');

const root = findRoot(__dirname);
const acl = require(path.join(root, 'src', 'config', 'access-control.js'));

module.exports = (item, allow=false) => {
    let route = acl.filter(route => route[0] === item);
    if(route.length != 1) {
        console.error("(1) Bad access control for item " + item);
        process.exit(1);
    }

    routeGroups = route[0];
    if(!Array.isArray(routeGroups)) {
        console.error("(2) Bad access control for item " + item);
        process.exit(1);
    }
    routeGroups = routeGroups[1];

    return async (req, res, next) => {
        const user = await req.transaction.db.User.findByPk(req.transaction.info.userId);
        const groups = await user.getGroups();

        req.transaction.logger.debug('finding', routeGroups, 'in', groups.map(g => g.name), '(route is', route[0][0], ')');

        const names = groups.map(group => group.name);
        const filtered = names.filter(name => routeGroups.includes(name))

        req.transaction.info.isAuthorized = (filtered.length > 0);

        if(!allow && !req.transaction.info.isAuthorized) {
            return res.boom.unauthorized("Access control denied access");
        } else {
            return next();
        }
    }
}