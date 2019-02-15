const winston = require('winston');
const config = require('./config');
const fs = require('fs'); // File system
require('winston-mail');


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
        filename: '../logs/debug.log',
    }),
    new winston.transports.File({
        level: 'info',
        filename: '../logs/info.log',
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

transports.forEach((el) => {
    el.setMaxListeners(100);
})

let format = winston.format.combine(winston.format.timestamp(), winston.format.prettyPrint())

module.exports = {
    logdir,
    winston_opts: {
        transports,
        format
    }
}