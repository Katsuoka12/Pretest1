const express = require('express');
const { z } = require('zod');
const pool = require('./db');
const { createTaskSchema, updateTaskSchema } = require('./schemas/taskSchema');
const cors = require('cors');

app.use(cors());
const app = express();
app.use(express.json());

// Middleware Validation
const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ errors: err.errors });
    }
    next(err);
  }
};

// Routes
app.get('/tasks', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tasks');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/tasks/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'ไม่พบงาน' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/tasks', validate(createTaskSchema), async (req, res) => {
  try {
    const { title, description, due_date, category_id, status_id } = req.body;
    
    // การป้องกัน double protection: ถ้าส่ง category_id เป็น null จริงๆ ให้เป็น null แต่ถ้าไม่มีเลย ให้เป็น null ได้ (อนุญาตโดย DB)
    // แต่เพื่อความปลอดภัย ถ้าหาก DB ไม่อนุญาต null เราจะใช้ 1
    const safeCategoryId = (category_id === undefined || category_id === null) ? null : category_id;

    const sql = `INSERT INTO tasks (title, description, due_date, category_id, status_id) VALUES (?, ?, ?, ?, ?)`;
    const values = [title, description, due_date, safeCategoryId, status_id];
    
    const [result] = await pool.query(sql, values);
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: error.message });
  }
});

app.put('/tasks/:id', validate(updateTaskSchema), async (req, res) => {
  try {
    const { title, description, due_date, category_id, status_id } = req.body;
    const safeCategoryId = (category_id === undefined || category_id === null) ? null : category_id;

    const sql = `UPDATE tasks SET title=?, description=?, due_date=?, category_id=?, status_id=? WHERE id=?`;
    const values = [title, description, due_date, safeCategoryId, status_id, req.params.id];
    
    const [result] = await pool.query(sql, values);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'ไม่พบงาน' });
    res.json({ message: 'อัปเดตสำเร็จ' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/tasks/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM tasks WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'ไม่พบงาน' });
    res.json({ message: 'ลบสำเร็จ' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({ message: err.message });
});

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`🌎 API URL: http://localhost:${PORT}/tasks`);
  });
}

module.exports = app;