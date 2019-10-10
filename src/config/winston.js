const winston = require('winston');
const config = require('./config');
const path = require('path');
const fs = require('fs'); // File system
require('winston-daily-rotate-file');


const logdir = './logs';
if (!fs.existsSync(logdir)) { fs.mkdirSync(logdir);}


const transports = [
    new winston.transports.Console({
        level: 'warn',
        colorize: true
    }), 
    new winston.transports.DailyRotateFile({
        level: 'debug',
        filename: 'debug.log',
        zippedArchive: true,
        date_format: "YYYY-MM-DD",
        maxSize: '2m',
        maxFiles: '90d',
        dirname: path.join(logdir, '%DATE%')
    }),
    new winston.transports.DailyRotateFile({
        level: 'info',
        filename: 'info.log',
        zippedArchive: true,
        date_format: "YYYY-MM-DD",
        maxSize: '2m',
        maxFiles: '90d',
        dirname: path.join(logdir,'%DATE%')
    }),

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