// Set environment variables for message and auth services
process.env.MESSAGE_API = 'http://fake/messages';
process.env.AUTH_SERVICE_URL = 'http://fake-auth';

import request from 'supertest';
import app from '../index';
import mockAxios from 'axios';

jest.mock('axios');

describe('Message Routes with access control', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Reset all mocks before each test

    // Mock access check and message API
    (mockAxios.post as jest.Mock).mockImplementation((url: string, data: any) => {
      if (url.includes('/access/check')) {
        return Promise.resolve({ status: 200 }); // Access granted
      }
      if (url === 'http://fake/messages') {
        // Simulate message creation
        return Promise.resolve({
          data: { MESN_ID: 2, MESC_CONTENT: data.content },
        });
      }
    });

    // Mock message retrieval with query params
    (mockAxios.get as jest.Mock).mockImplementation((url: string, config?: any) => {
      if (
        url === 'http://fake/messages' &&
        config?.params?.from === '1' &&
        config?.params?.to === '2'
      ) {
        return Promise.resolve({
          data: [{ MESN_ID: 1, MESC_CONTENT: 'Hello' }],
        });
      }
      return Promise.resolve({ data: [] }); // default fallback
    });
  });

  it('should return messages between users with valid token', async () => {
    const res = await request(app)
      .get('/messages')
      .query({ from: '1', to: '2' })
      .set('Authorization', 'Bearer valid_token');

    expect(res.status).toBe(200); // Successful fetch
    expect(res.body).toEqual([{ MESN_ID: 1, MESC_CONTENT: 'Hello' }]);
  });

  it('should send a message with valid token', async () => {
    const res = await request(app)
      .post('/messages')
      .set('Authorization', 'Bearer valid_token')
      .send({ sender: 1, receiver: 2, content: 'Hello from test!' });

    expect(res.status).toBe(200); // Successful send
    expect(res.body).toEqual({ MESN_ID: 2, MESC_CONTENT: 'Hello from test!' });
  });
});
