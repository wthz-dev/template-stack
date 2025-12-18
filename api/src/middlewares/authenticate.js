const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const { UnauthorizedError } = require('../shared/errors');
const { User } = require('../models');

async function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const [type, token] = header.split(' ');

  if (type !== 'Bearer' || !token) {
    return next(new UnauthorizedError('Missing Bearer token'));
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findByPk(payload.userId);

    if (!user) {
      return next(new UnauthorizedError('Invalid token'));
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    return next();
  } catch (err) {
    return next(new UnauthorizedError('Invalid token'));
  }
}

module.exports = { authenticate };
