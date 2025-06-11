// Set mock environment variables
process.env.EVENT_API = 'http://fake/events';
process.env.AUTH_SERVICE_URL = 'http://fake-auth';

import { getEventById } from '../controllers/eventController';
import mockAxios from 'axios';
import { Request, Response } from 'express';

// Mock axios globally for all tests
jest.mock('axios');

describe('getEventById Controller with access control', () => {

  // Test case: successful retrieval of event data
  it('should return event data with valid token and access', async () => {
    const req = {
      headers: { authorization: 'Bearer valid_token' },
      params: { id: '42' }
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      sendStatus: jest.fn()
    } as unknown as Response;

    // Simulate successful permission check and event fetch
    (mockAxios.post as jest.Mock).mockResolvedValue({ status: 200 }); 
    (mockAxios.get as jest.Mock).mockResolvedValue({
      data: { id: 42, title: 'Event Test' }
    });

    await getEventById(req, res);

    // Check permission check call
    expect(mockAxios.post).toHaveBeenCalledWith(
      'http://fake-auth/access/check',
      { token: 'valid_token', rightName: 'VIEW_EVENTS' }
    );

    // Check event data request
    expect(mockAxios.get).toHaveBeenCalledWith('http://fake/events/42');

    // Validate response
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ id: 42, title: 'Event Test' });
  });

  // Test case: missing token
  it('should return 401 if no token provided', async () => {
    const req = { headers: {}, params: { id: '42' } } as unknown as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      sendStatus: jest.fn()
    } as unknown as Response;

    await getEventById(req, res);

    // Should return 401 Unauthorized
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'No token provided' });
  });

  // Test case: access denied from auth service
  it('should return 403 if access denied', async () => {
    const req = {
      headers: { authorization: 'Bearer invalid_token' },
      params: { id: '42' }
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      sendStatus: jest.fn()
    } as unknown as Response;

    // Simulate permission denied
    (mockAxios.post as jest.Mock).mockResolvedValue({ status: 403 }); 

    await getEventById(req, res);

    // Should return 403 Forbidden
    expect(res.sendStatus).toHaveBeenCalledWith(403);
  });
});
