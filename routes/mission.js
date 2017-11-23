'use strict';

const router = require('express').Router();
const mission_controller = require('../controllers/mission_controller');

router.route('/').
    get(mission_controller.index).
    post(mission_controller.store);

router.route('/:missionId([0-9]+)').
    get(mission_controller.show).
    put(mission_controller.update).
    delete(mission_controller.delete);

module.exports = router;
