process.env.PROFILE_API = 'http://fake';
process.env.AUTH_SERVICE_URL = 'http://fake-auth';
import { getAllProfiles, getProfileById } from '../controllers/profileController';
import mockAxios from 'axios';
import { Request, Response } from 'express';

jest.mock('axios');

describe('Profile Controller with access control', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch all profiles with valid token and access', async () => {
    const req = {
      headers: { authorization: 'Bearer valid_token' },
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    (mockAxios.post as jest.Mock).mockResolvedValue({ status: 200 });
    (mockAxios.get as jest.Mock).mockResolvedValue({
      data: [{ id: 1, name: 'User Test' }],
    });

    await getAllProfiles(req, res);

    expect(mockAxios.post).toHaveBeenCalledWith('http://fake-auth/access/check', {
      token: 'valid_token',
      rightName: 'VIEW_PROFILES',
    });

    expect(mockAxios.get).toHaveBeenCalledWith('http://fake/profiles');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([{ id: 1, name: 'User Test' }]);
  });

  it('should fetch profile by ID with valid token and access', async () => {
    const req = {
      headers: { authorization: 'Bearer valid_token' },
      params: { id: '99' },
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    (mockAxios.post as jest.Mock).mockResolvedValue({ status: 200 });
    (mockAxios.get as jest.Mock).mockResolvedValue({
      data: { id: 99, name: 'User 99' },
    });

    await getProfileById(req, res);

    expect(mockAxios.post).toHaveBeenCalledWith('http://fake-auth/access/check', {
      token: 'valid_token',
      rightName: 'VIEW_PROFILES',
    });

    expect(mockAxios.get).toHaveBeenCalledWith('http://fake/profiles/99');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ id: 99, name: 'User 99' });
  });
});
