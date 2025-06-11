// ⚠️ Important : définir AVANT import
process.env.EVENT_API = 'http://fake/events';
process.env.AUTH_SERVICE_URL = 'http://fake-auth';

import request from 'supertest';
import app from '../index';
import mockAxios from 'axios';

jest.mock('axios');

describe('Event Routes with Access Control', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (mockAxios.post as jest.Mock).mockImplementation((url, data) => {
      if (url.includes('/access/check') && data.rightName === 'VIEW_EVENTS') {
        return Promise.resolve({ status: 200 }); // access granted
      }
      return Promise.resolve({ status: 403 });
    });

    (mockAxios.get as jest.Mock).mockImplementation((url) => {
      if (url === 'http://fake/events/42') {
        return Promise.resolve({ data: { id: 42, title: 'Event Test' } });
      }
      return Promise.resolve({ data: [] });
    });
  });

  it('should return event by ID with valid token and rights', async () => {
    const res = await request(app)
      .get('/events/42')
      .set('Authorization', 'Bearer valid_token');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 42, title: 'Event Test' });
  });

  it('should return 401 if no token is provided', async () => {
    const res = await request(app).get('/events/42');
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'No token provided' });
  });

  it('should return 403 if access is denied', async () => {
    (mockAxios.post as jest.Mock).mockResolvedValueOnce({ status: 403 });

    const res = await request(app)
      .get('/events/42')
      .set('Authorization', 'Bearer invalid_token');

    expect(res.status).toBe(403);
  });
});
