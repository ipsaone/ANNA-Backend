'use strict';
module.exports = (sequelize, DataTypes) => {
  const event = sequelize.define('Event', {
    name: DataTypes.STRING
  });

  return event;
};