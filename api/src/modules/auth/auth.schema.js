const { z } = require('zod');

const loginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

module.exports = {
  loginBodySchema
};
