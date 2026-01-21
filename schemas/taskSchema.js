const { z } = require('zod');

const createTaskSchema = z.object({
  title: z.string().min(1, "หัวข้องานต้องไม่ว่างเปล่า").max(255),
  description: z.string().optional(),
  due_date: z.string().datetime().optional(),
  category_id: z.number().int().positive().optional().nullable(), // เป็นค่าว่างได้
  status_id: z.number().int().positive("รหัสสถานะไม่ถูกต้อง").default(1)
});

const updateTaskSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  due_date: z.string().datetime().optional(),
  category_id: z.number().int().positive().optional().nullable(),
  status_id: z.number().int().positive().optional()
});

module.exports = { createTaskSchema, updateTaskSchema };