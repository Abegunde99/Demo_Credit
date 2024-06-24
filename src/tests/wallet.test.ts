import request from 'supertest';
import app from '../app';

describe('WalletController', () => {
  let authToken: string;

  beforeAll(async () => {
    // Register a user and login to get a token for authenticated requests
    await request(app).post('/register').send({
      firstName: 'John',
      lastName: 'Doe',
      email: 'johndoe@example.com',
      password: 'password123'
    });

    const response = await request(app).post('/login').send({
      email: 'johndoe@example.com',
      password: 'password123'
    });

    authToken = response.body.data.token;
  });

  describe('GET /wallet', () => {
    it('should get user wallet successfully', async () => {
      const response = await request(app)
        .get('/wallet')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('balance');
    });

    it('should return error for unauthorized access', async () => {
      const response = await request(app).get('/wallet');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Authentication required');
    });
  });

  describe('POST /wallet/transfer', () => {
    it('should transfer funds successfully', async () => {
      const response = await request(app)
        .post('/wallet/transfer')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          recipientAccount: '1234567890',
          amount: 100
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'transfer is completed');
    });

    it('should return error for insufficient funds', async () => {
      const response = await request(app)
        .post('/wallet/transfer')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          recipientAccount: '1234567890',
          amount: 1000000
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Insufficient funds');
    });
  });

  describe('POST /wallet/fund', () => {
    it('should initiate fund transfer successfully', async () => {
      const response = await request(app)
        .post('/wallet/fund')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 500
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'transfer is being processed');
      expect(response.body.data).toHaveProperty('checkoutUrl');
    });
  });

  describe('GET /wallet/verifyPayment', () => {
    it('should verify payment successfully', async () => {
      const response = await request(app)
        .get('/wallet/verifyPayment?reference=validReference')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Verification complete');
    });

    it('should return error for invalid payment reference', async () => {
      const response = await request(app)
        .get('/wallet/verifyPayment?reference=invalidReference')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Invalid payment reference');
    });
  });

  describe('POST /wallet/withdraw', () => {
    it('should withdraw funds successfully', async () => {
      const response = await request(app)
        .post('/wallet/withdraw')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 100
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'withdrawal is completed');
    });

    it('should return error for insufficient funds', async () => {
      const response = await request(app)
        .post('/wallet/withdraw')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 1000000
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Insufficient funds');
    });
  });
});
