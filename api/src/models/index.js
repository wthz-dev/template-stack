const { sequelize } = require('../config/sequelize');
const { initUserModel } = require('../modules/users/user.model');
const { initArticleModel } = require('../modules/articles/article.model');

const User = initUserModel(sequelize);
const Article = initArticleModel(sequelize);

User.hasMany(Article, { foreignKey: 'authorId', as: 'articles' });
Article.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

module.exports = {
  sequelize,
  User,
  Article
};
