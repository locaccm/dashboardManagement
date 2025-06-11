// Set environment variables for the lease and auth API endpoints
process.env.LEASE_API = 'http://fake';
process.env.AUTH_SERVICE_URL = 'http://fake-auth';

import request from 'supertest';
import app from '../index'; // Import the Express app
import mockAxios from 'axios';

// Mock the axios module to avoid real HTTP calls
jest.mock('axios');

describe('Lease Routes with access control', () => {
  // Setup before each test
  beforeEach(() => {
    jest.clearAllMocks(); // Clear mock state between tests

    // Mock axios.post for access control and lease creation
    (mockAxios.post as jest.Mock).mockImplementation((url: string, data: any) => {
      // Simulate access control check
      if (url.includes('/access/check') && data.rightName === 'CREATE_LEASE') {
        return Promise.resolve({ status: 200 }); // Access granted
      }

      // Simulate lease creation
      if (url === 'http://fake/lease') {
        return Promise.resolve({ data: { id: 1, ...data } }); // Lease created
      }

      // Default: access denied
      return Promise.resolve({ status: 403 });
    });
  });

  it('should create a lease via POST /leases with valid token', async () => {
    // Lease data to send in the request body
    const leaseData = {
      LEAD_START: '2024-01-01',
      LEAD_END: '2024-12-31',
      LEAN_RENT: 900,
      LEAN_CHARGES: 50,
      USEN_ID: 1,
      ACCN_ID: 1,
    };

    // Send POST request to /leases with authorization header and lease data
    const res = await request(app)
      .post('/leases')
      .set('Authorization', 'Bearer valid_token')
      .send(leaseData);

    // Expect successful creation
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 1, ...leaseData });
  });
});
