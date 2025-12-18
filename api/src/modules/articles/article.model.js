const { DataTypes } = require('sequelize');

function initArticleModel(sequelize) {
  const Article = sequelize.define(
    'Article',
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
      },
      slug: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      summary: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      content: {
        type: DataTypes.TEXT('long'),
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('draft', 'published', 'scheduled'),
        allowNull: false,
        defaultValue: 'draft'
      },
      publishedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'published_at'
      },
      scheduledAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'scheduled_at'
      },
      authorId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        field: 'author_id'
      }
    },
    {
      tableName: 'articles',
      underscored: true,
      indexes: [
        { fields: ['slug'], unique: true },
        { fields: ['status'] },
        { fields: ['scheduled_at'] }
      ]
    }
  );

  return Article;
}

module.exports = { initArticleModel };
