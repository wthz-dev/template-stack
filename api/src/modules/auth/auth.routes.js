const express = require('express');
const { validate } = require('../../middlewares/validate');
const { authenticate } = require('../../middlewares/authenticate');
const controller = require('./auth.controller');
const { loginBodySchema } = require('./auth.schema');

const router = express.Router();

router.post('/login', validate({ body: loginBodySchema }), controller.login);
router.get('/me', authenticate, controller.me);

module.exports = { router };
