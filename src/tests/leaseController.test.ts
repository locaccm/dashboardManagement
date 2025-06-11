// Define mock environment variables for API endpoints
process.env.LEASE_API = 'http://fake';
process.env.AUTH_SERVICE_URL = 'http://fake-auth';

import { createLease } from '../controllers/leaseController';
import mockAxios from 'axios';
import { Request, Response } from 'express';

// Mock the axios library
jest.mock('axios');

describe('Lease Controller with access control', () => {
  // Clear mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create lease with valid token and access', async () => {
    // Simulated request object
    const req = {
      headers: { authorization: 'Bearer valid_token' }, // Mocked JWT
      body: { LEAD_START: '2024-01-01' }, // Lease data
    } as unknown as Request;

    // Simulated response object with chained `status().json()`
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    // Mocking axios.post behavior
    (mockAxios.post as jest.Mock).mockImplementation((url: string, data: any) => {
      // Simulate access control check
      if (url.includes('/access/check')) {
        return Promise.resolve({ status: 200 }); // Access granted
      }
      // Simulate lease creation
      if (url.includes('/lease')) {
        return Promise.resolve({ data: { id: 1, ...data } });
      }
    });

    // Call the controller function
    await createLease(req, res);

    // Verify access check call
    expect(mockAxios.post).toHaveBeenCalledWith('http://fake-auth/access/check', {
      token: 'valid_token',
      rightName: 'CREATE_LEASE',
    });

    // Verify lease creation API call
    expect(mockAxios.post).toHaveBeenCalledWith('http://fake/lease', req.body);

    // Verify HTTP response from controller
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: 1, LEAD_START: '2024-01-01' });
  });
});
