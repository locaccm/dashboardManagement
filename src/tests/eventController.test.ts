// ✅ Définir les variables d'environnement **avant** l'import du contrôleur
process.env.EVENT_API = 'http://fake/events';
process.env.AUTH_SERVICE_URL = 'http://fake-auth';

import { getEventById } from '../controllers/eventController';
import mockAxios from 'axios';
import { Request, Response } from 'express';

jest.mock('axios');

describe('getEventById Controller with access control', () => {
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

    (mockAxios.post as jest.Mock).mockResolvedValue({ status: 200 }); // access granted
    (mockAxios.get as jest.Mock).mockResolvedValue({
      data: { id: 42, title: 'Event Test' }
    });

    await getEventById(req, res);

    expect(mockAxios.post).toHaveBeenCalledWith(
      'http://fake-auth/access/check',
      { token: 'valid_token', rightName: 'VIEW_EVENTS' }
    );

    expect(mockAxios.get).toHaveBeenCalledWith('http://fake/events/42');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ id: 42, title: 'Event Test' });
  });

  it('should return 401 if no token provided', async () => {
    const req = { headers: {}, params: { id: '42' } } as unknown as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      sendStatus: jest.fn()
    } as unknown as Response;

    await getEventById(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'No token provided' });
  });

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

    (mockAxios.post as jest.Mock).mockResolvedValue({ status: 403 }); // access denied

    await getEventById(req, res);

    expect(res.sendStatus).toHaveBeenCalledWith(403);
  });
});
