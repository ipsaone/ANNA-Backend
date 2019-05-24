const winston = require('winston');
const config = require('./config');
const path = require('path');
const fs = require('fs'); // File system


const logdir = './logs';
if (!fs.existsSync(logdir)) { fs.mkdirSync(logdir);}


const transports = [
    new winston.transports.Console({
        level: 'warn',
        colorize: true
    }), 

    // SEE https://github.com/winstonjs/winston/issues/1573 
    new winston.transports.File({
        level: 'debug',
        filename: path.join(logdir, 'debug.log'),
    }),
    new winston.transports.File({
        level: 'info',
        filename: path.join(logdir, 'info.log'),
    })
];




if (!process.env.TEST || !process.env.NOEMAIL) {
    
}

transports.forEach((el) => {
    el.setMaxListeners(1e5);
});

module.exports = {
    logdir,
    transports
}