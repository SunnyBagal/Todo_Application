const router = require('express').Router();
const Todo = require('../models/Todo');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createTodoSchema, editTodoSchema } = require('../schemas/todoSchema');

router.post('/', auth, validate(createTodoSchema), async (req, res) => {
  const { title, description, priority } = req.body;

  try {

    const todo = await Todo.create({
      userId: req.userId,
      title,
      description,
      priority: priority || 'low',
      done: false,
    });

    res.status(201).json({ todo });
  } catch (e) {
    res.status(500).json({ message: 'Something went wrong' });
  }
});

router.get('/', auth, async (req, res) => {
  try {

    const filter = { userId: req.userId };

    if (req.query.status === 'completed') filter.done = true;
    if (req.query.status === 'active') filter.done = false;

    if (req.query.priority && ['low', 'medium', 'high'].includes(req.query.priority)) {
      filter.priority = req.query.priority;
    }

    const todos = await Todo.find(filter).sort({ createdAt: -1 });
    res.json({ todos });
  } catch (e) {
    res.status(500).json({ message: 'Something went wrong' });
  }
});

router.patch('/:id', auth, validate(editTodoSchema), async (req, res) => {
  const { title, description, done, priority } = req.body;

  const updateFields = {};
  if (title !== undefined) updateFields.title = title;
  if (description !== undefined) updateFields.description = description;
  if (priority !== undefined) updateFields.priority = priority;

  if (done !== undefined) {
    updateFields.done = done;
    updateFields.completedAt = done ? new Date() : null;
  }

  if (Object.keys(updateFields).length === 0) {
    return res.status(400).json({ message: 'Nothing to update' });
  }

  try {

    const todo = await Todo.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: updateFields },
      { returnDocument: 'after' }
    );

    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    res.json({ todo });
  } catch (e) {
    res.status(500).json({ message: 'Something went wrong' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {

    const todo = await Todo.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    res.json({ message: 'Todo deleted' });
  } catch (e) {
    res.status(500).json({ message: 'Something went wrong' });
  }
});

module.exports = router;
