const { Sequelize, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Room = sequelize.define('Room', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true, // Automatically increments the value for each new record
        allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  });

  return User;
};
