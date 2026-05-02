const { z } = require('zod');

const createTodoSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
});

const editTodoSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  done: z.boolean().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
});

module.exports = { createTodoSchema, editTodoSchema };