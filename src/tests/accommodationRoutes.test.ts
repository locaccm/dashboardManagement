import request from 'supertest';
import app from '../index';
import mockAxios from 'axios';

// Mock axios globally
jest.mock('axios');

// Setup environment variables before tests run
beforeAll(() => {
  process.env.ACCOMMODATION_API = 'http://fake';
  process.env.AUTH_SERVICE_URL = 'http://fake-auth';
});

describe('Accommodation Routes', () => {
  // Reset mocks before each test to avoid interference
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock the access check call
    (mockAxios.post as jest.Mock).mockImplementation((url: string, data: any) => {
      if (url.includes('/access/check') && data.rightName === 'VIEW_ACCOMMODATIONS') {
        return Promise.resolve({ status: 200 }); // Simulate access granted
      }
      return Promise.resolve({ status: 403 }); // Simulate access denied
    });

    // Mock the accommodation fetch call
    (mockAxios.get as jest.Mock).mockImplementation((url: string, config?: any) => {
      if (url.includes('/read') && config?.params?.userId === '123') {
        return Promise.resolve({
          data: [{ ACCN_ID: 1, ACCC_NAME: 'Appartement Test' }]
        });
      }
      return Promise.resolve({ data: [] });
    });
  });

  // Test successful fetch of accommodations
  it('should fetch accommodations for a given userId', async () => {
    const res = await request(app)
      .get('/accommodations')
      .query({ userId: '123' })
      .set('Authorization', 'Bearer valid_token'); // Simulate valid JWT

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      { ACCN_ID: 1, ACCC_NAME: 'Appartement Test' }
    ]);
  });

  // Test case when no token is provided
  it('should return 401 if no token provided', async () => {
    const res = await request(app).get('/accommodations').query({ userId: '123' });
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'No token provided' });
  });

  // Test access denied when permission is missing
  it('should return 403 if access denied', async () => {
    (mockAxios.post as jest.Mock).mockResolvedValueOnce({ status: 403 }); // Force denial
    const res = await request(app)
      .get('/accommodations')
      .query({ userId: '123' })
      .set('Authorization', 'Bearer invalid_token');
    expect(res.status).toBe(403);
  });
});
