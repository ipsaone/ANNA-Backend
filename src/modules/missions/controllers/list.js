'use strict';

module.exports = (db) => async (req, res) => {
    
    req.transaction.logger.info('Finding missions');
    const missions = await db.Mission.findAll({
        attributes: { 
            include: [[db.Sequelize.fn("COUNT", db.Sequelize.col("members.id")), "memberCount"]] 
        },
        include: [
            {model: db.User, as: 'members'}
        ],
        group: [
            'Mission.id'
        ]
    });


    req.transaction.logger.info('Sending response');
    return res.status(200).json(missions);
};
