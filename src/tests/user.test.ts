import request from 'supertest';
import app from '../app';

describe('UserController', () => {
  describe('POST /register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'johndoe@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'user successfully created');
      expect(response.body.data).toHaveProperty('email', 'johndoe@example.com');
    });

    it('should return error if user already exists', async () => {
      // Mock a user already existing
      const response = await request(app)
        .post('/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'existinguser@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'user already exists');
    });
  });

  describe('POST /login', () => {
    it('should login a user successfully', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          email: 'johndoe@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'login successful');
      expect(response.body.data).toHaveProperty('email', 'johndoe@example.com');
    });

    it('should return error for invalid credentials', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          email: 'johndoe@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });
  });

});
