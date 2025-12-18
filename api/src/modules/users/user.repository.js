const { User } = require('../../models');

async function findByEmail(email) {
  return User.findOne({ where: { email } });
}

async function findById(id) {
  return User.findByPk(id);
}

async function createUser({ email, passwordHash, role }) {
  return User.create({ email, passwordHash, role });
}

module.exports = {
  findByEmail,
  findById,
  createUser
};
