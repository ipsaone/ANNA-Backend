const winston = require('winston');
const config = require('./config');
const path = require('path');
const fs = require('fs'); // File system
require('winston-daily-rotate-file');



module.exports = options => {

    const logdir = './logs';
    if (!fs.existsSync(logdir)) { fs.mkdirSync(logdir);}


    const transports = [
        new winston.transports.Console({
            level: 'warn',
            colorize: true
        }), 
    ];


    if(!options.test) {
        transports.push(new winston.transports.DailyRotateFile({
            level: 'debug',
            filename: 'debug.log',
            zippedArchive: true,
            date_format: "YYYY-MM-DD",
            maxSize: '2m',
            maxFiles: '10d',
            dirname: path.join(logdir, '%DATE%')
        }));
        transports.push(new winston.transports.DailyRotateFile({
            level: 'info',
            filename: 'info.log',
            zippedArchive: true,
            date_format: "YYYY-MM-DD",
            maxSize: '2m',
            maxFiles: '90d',
            dirname: path.join(logdir,'%DATE%')
        }));
    } else {
        let debugFilename = "debug-unknown.log"
        if(options.testfile) {
            debugFilename = "debug-"+options.testfile.split('/').splice(6).join("-")+".log"
            infoFilename = "info-"+options.testfile.split('/').splice(6).join("-")+".log"
            warnFilename = "warn-"+options.testfile.split('/').splice(6).join("-")+".log"
        }

        transports.push(new winston.transports.DailyRotateFile({
            level: 'debug',
            filename: debugFilename,
            zippedArchive: true,
            date_format: "YYYY-MM-DD",
            maxSize: '2m',
            maxFiles: '10d',
            dirname: path.join(logdir, 'test')
        }));

        transports.push(new winston.transports.DailyRotateFile({
            level: 'info',
            filename: infoFilename,
            zippedArchive: true,
            date_format: "YYYY-MM-DD",
            maxSize: '2m',
            maxFiles: '10d',
            dirname: path.join(logdir, 'test')
        }));

        transports.push(new winston.transports.DailyRotateFile({
            level: 'warn',
            filename: warnFilename,
            zippedArchive: true,
            date_format: "YYYY-MM-DD",
            maxSize: '2m',
            maxFiles: '10d',
            dirname: path.join(logdir, 'test')
        }));
    }


    transports.forEach((el) => {
        el.setMaxListeners(1e5);
    });


    return {logdir, transports};
}