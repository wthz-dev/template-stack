const { ForbiddenError, UnauthorizedError } = require('../shared/errors');

function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Unauthenticated'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('Insufficient role'));
    }

    return next();
  };
}

module.exports = { requireRole };
