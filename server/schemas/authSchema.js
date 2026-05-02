const { z } = require('zod');

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(5).max(100),
  name: z.string().min(3).max(25),
});

const signinSchema = z.object({
  email: z.string().email(),
  password: z.string().min(5).max(100),
});

module.exports = { signupSchema, signinSchema };