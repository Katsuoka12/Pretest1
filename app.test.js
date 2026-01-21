const request = require('supertest');
const app = require('./app');
const pool = require('./db');

beforeAll(async () => {
  await pool.query('DELETE FROM tasks');
});

describe('Task API Tests', () => {
  
  it('should create a new task successfully', async () => {
    const res = await request(app)
      .post('/tasks')
      .send({
        title: 'งานทดสอบสมบูรณ์',
        status_id: 1
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
  });

  it('should return 400 if title is missing', async () => {
    const res = await request(app)
      .post('/tasks')
      .send({ status_id: 1 });
    expect(res.statusCode).toEqual(400);
    expect(res.body.errors).toBeDefined();
  });

  it('should get a list of tasks', async () => {
    const res = await request(app).get('/tasks');
    expect(Array.isArray(res.body)).toBeTruthy();
  });

  it('should update a task', async () => {
    const createRes = await request(app)
      .post('/tasks')
      .send({ title: 'งานเดิม', status_id: 1 });
    const taskId = createRes.body.id;

    const updateRes = await request(app)
      .put(`/tasks/${taskId}`)
      .send({ title: 'งานใหม่ที่แก้ไข', status_id: 2 });
    
    expect(updateRes.statusCode).toEqual(200);
  });

  it('should delete a task', async () => {
    const createRes = await request(app)
      .post('/tasks')
      .send({ title: 'งานที่จะลบ', status_id: 1 });
    const taskId = createRes.body.id;

    const deleteRes = await request(app).delete(`/tasks/${taskId}`);
    expect(deleteRes.statusCode).toEqual(200);
  });
});

afterAll(async () => {
  await pool.end();
});