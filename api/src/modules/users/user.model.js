const { DataTypes } = require('sequelize');

function initUserModel(sequelize) {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
      },
      passwordHash: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'password_hash'
      },
      role: {
        type: DataTypes.ENUM('admin', 'editor', 'user'),
        allowNull: false,
        defaultValue: 'user'
      }
    },
    {
      tableName: 'users',
      underscored: true
    }
  );

  return User;
}

module.exports = { initUserModel };
