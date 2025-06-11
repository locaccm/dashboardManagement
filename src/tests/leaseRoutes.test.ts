process.env.LEASE_API = 'http://fake';
process.env.AUTH_SERVICE_URL = 'http://fake-auth';

import request from 'supertest';
import app from '../index';
import mockAxios from 'axios';

jest.mock('axios');

describe('Lease Routes with access control', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (mockAxios.post as jest.Mock).mockImplementation((url: string, data: any) => {
      if (url.includes('/access/check') && data.rightName === 'CREATE_LEASE') {
        return Promise.resolve({ status: 200 });
      }

      if (url === 'http://fake/lease') {
        return Promise.resolve({ data: { id: 1, ...data } });
      }

      return Promise.resolve({ status: 403 });
    });
  });

  it('should create a lease via POST /leases with valid token', async () => {
    const leaseData = {
      LEAD_START: '2024-01-01',
      LEAD_END: '2024-12-31',
      LEAN_RENT: 900,
      LEAN_CHARGES: 50,
      USEN_ID: 1,
      ACCN_ID: 1,
    };

    const res = await request(app)
      .post('/leases')
      .set('Authorization', 'Bearer valid_token')
      .send(leaseData);

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 1, ...leaseData });
  });
});
