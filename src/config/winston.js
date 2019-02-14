const winston = require('winston');
const config = require('./config');
require('winston-mail');

const transports = [
    new winston.transports.Console({
        level: 'warn',
        colorize: true
    }),
    new winston.transports.File({
        level: 'debug',
        name: 'file#debug',
        filename: './logs/debug.log',
        colorize: true,
        maxsize: 131072, // 1Mb
        tailable: true,
        zippedArchive: true,

    }),
    new winston.transports.File({
        level: 'info',
        name: 'file#info',
        filename: './logs/info.log',
        colorize: true,
        maxsize: 131072, // 1Mb
        tailable: true,
        zippedArchive: true,
    })
];

if (!process.env.TEST || !process.env.NOEMAIL) {
    transports.push(new winston.transports.Mail({
        level: 'error',
        from: config.email.sender,
        to: config.email.errorManagers,
        host: "smtp.gmail.com",
        username: config.email.sender,
        password: config.email.password,
        port: 587,
        ssl: false,
        tls: true
    }));
}


module.exports = () => { 
    winston.configure({transports});
}