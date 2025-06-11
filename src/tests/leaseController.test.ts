// ✅ Toujours définir AVANT tout import
process.env.LEASE_API = 'http://fake';
process.env.AUTH_SERVICE_URL = 'http://fake-auth';

import { createLease } from '../controllers/leaseController';
import mockAxios from 'axios';
import { Request, Response } from 'express';

jest.mock('axios');

describe('Lease Controller with access control', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create lease with valid token and access', async () => {
    const req = {
      headers: { authorization: 'Bearer valid_token' },
      body: { LEAD_START: '2024-01-01' },
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    (mockAxios.post as jest.Mock).mockImplementation((url: string, data: any) => {
      if (url.includes('/access/check')) {
        return Promise.resolve({ status: 200 });
      }
      if (url.includes('/lease')) {
        return Promise.resolve({ data: { id: 1, ...data } });
      }
    });

    await createLease(req, res);

    expect(mockAxios.post).toHaveBeenCalledWith('http://fake-auth/access/check', {
      token: 'valid_token',
      rightName: 'CREATE_LEASE',
    });

    expect(mockAxios.post).toHaveBeenCalledWith('http://fake/lease', req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: 1, LEAD_START: '2024-01-01' });
  });
});
