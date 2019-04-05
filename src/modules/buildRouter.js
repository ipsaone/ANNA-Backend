const findRoot = require('find-root');
const root = findRoot(__dirname);
const path = require('path')

module.exports = (db) => {
    // Importing routes
    const router = require('express').Router();

    router.use((req, res, next) => { 
        req.transaction.db = db;
        req.transaction.db.sequelize.options.logging = data => {
            req.transaction.logger.debug('SQL request', {data: data});
        }
        return next();
    });
    router.use('/', require('./home').routes);
    const directories =
          require('fs').readdirSync(path.join(root, 'src', 'modules'))
              .map((name) => path.join(root, 'src', 'modules', name))
              .filter((source) => require('fs').lstatSync(source)
                  .isDirectory())
              .map((folder) => path.basename(folder));

    directories.map((dir) => {
        const thisModule = require(path.join(root, 'src', 'modules', dir));

        router.use(`/${dir}`, thisModule.routes(db));

        return true;
    });
    router.all('*', (req, res) => res.boom.notFound());

    return router;
};