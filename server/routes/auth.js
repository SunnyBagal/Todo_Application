const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('../models/User');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const { signupSchema, signinSchema } = require('../schemas/authSchema');

const saltRounds = 10;
const JWT_SECRET = process.env.JWT_SECRET;

router.post('/signup', validate(signupSchema), async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await User.create({
      email,
      password: hashedPassword,
      username: name,
    });

    res.status(201).json({
      message: 'Signup successful',
    });
  } catch (e) {

    if (e.code === 11000) {
      return res.status(409).json({ message: 'Email already exists' });
    }
    return res.status(500).json({ message: 'Something went wrong' });
  }
});

router.post('/signin', validate(signinSchema), async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(403).json({ message: 'Incorrect credentials' });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return res.status(403).json({ message: 'Incorrect credentials' });
  }

  const token = jwt.sign({ id: user._id.toString() }, JWT_SECRET, {
    expiresIn: '24h',
  });

  res.json({ token });
});

router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (e) {
    res.status(500).json({ message: 'Something went wrong' });
  }
});

module.exports = router;
