const winston = require('winston');
const config = require('./config');
const fs = require('fs'); // File system
require('winston-mail');


const logdir = './logs';


const transports = [
    new winston.transports.Console({
        level: 'warn',
        colorize: true
    }), /*
    new winston.transports.File({
        level: 'debug',
        name: 'file#debug',
        filename: '../logs/debug.log',
        colorize: true,

    }),
    new winston.transports.File({
        level: 'info',
        name: 'file#info',
        filename: '../logs/info.log',
        colorize: true,
    })*/
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

let format = winston.format.combine(winston.format.timestamp(), winston.format.prettyPrint())
module.exports = () => {
    if (!fs.existsSync(logdir)) { fs.mkdirSync(logdir);}
    winston.configure({transports, format});
}