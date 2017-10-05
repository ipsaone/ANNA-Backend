module.exports = {
    app: {
        name: 'A.N.N.A',
        version: '1.0.0',
    },

    env: {
        dev: {
            host: '192.168.50.5',
            port: 8080
        },

        prod: {
            host: '127.0.0.1',
            port: 8080
        },
    },

    sequelize: {
        dialect: 'mysql',
        host: '127.0.0.1',
        username: 'root',
        password: 'OneServ_2017',
        database: 'ipsaone',
        logging: false // Prevent Sequelize from outpouting the query on the console
    },

    session: {
        socket: '/var/run/redis/redis.sock',
        secret: 'HYlFhWoHBGPxVnHqP45K',
    }
};