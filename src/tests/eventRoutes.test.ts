// Set environment variables used in the route/controller logic
process.env.EVENT_API = 'http://fake/events';
process.env.AUTH_SERVICE_URL = 'http://fake-auth';

import request from 'supertest';
import app from '../index';
import mockAxios from 'axios';

// Mock axios for API calls
jest.mock('axios');

describe('Event Routes with Access Control', () => {
  beforeEach(() => {
    // Clear all previous mock calls
    jest.clearAllMocks();

    // Mock access check API (AUTH_SERVICE_URL/access/check)
    (mockAxios.post as jest.Mock).mockImplementation((url, data) => {
      if (url.includes('/access/check') && data.rightName === 'VIEW_EVENTS') {
        // Simulate valid access
        return Promise.resolve({ status: 200 });
      }
      // Default to forbidden
      return Promise.resolve({ status: 403 });
    });

    // Mock GET event by ID from EVENT_API
    (mockAxios.get as jest.Mock).mockImplementation((url) => {
      if (url === 'http://fake/events/42') {
        return Promise.resolve({ data: { id: 42, title: 'Event Test' } });
      }
      return Promise.resolve({ data: [] });
    });
  });

  // Test: fetch event by ID with correct token and rights
  it('should return event by ID with valid token and rights', async () => {
    const res = await request(app)
      .get('/events/42')
      .set('Authorization', 'Bearer valid_token'); // Simulate valid JWT token

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 42, title: 'Event Test' });
  });

  // Test: missing token should return 401
  it('should return 401 if no token is provided', async () => {
    const res = await request(app).get('/events/42');

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'No token provided' });
  });

  // Test: token provided but access is denied
  it('should return 403 if access is denied', async () => {
    // Force mock to simulate denied access
    (mockAxios.post as jest.Mock).mockResolvedValueOnce({ status: 403 });

    const res = await request(app)
      .get('/events/42')
      .set('Authorization', 'Bearer invalid_token');

    expect(res.status).toBe(403);
  });
});
