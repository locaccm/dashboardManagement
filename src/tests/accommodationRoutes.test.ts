import request from 'supertest';
import app from '../index';
import mockAxios from 'axios';

jest.mock('axios');

// Important : définir la variable d'environnement AVANT d'importer app
beforeAll(() => {
  process.env.ACCOMMODATION_API = 'http://fake';
  process.env.AUTH_SERVICE_URL = 'http://fake-auth';
});

describe('Accommodation Routes', () => {
  beforeEach(() => {
    // Réinitialise tous les mocks
    jest.clearAllMocks();

    // Mock pour le checkAccess
    (mockAxios.post as jest.Mock).mockImplementation((url: string, data: any) => {
      // Vérifie si c'est l'appel pour checkAccess
      if (url.includes('/access/check') && data.rightName === 'VIEW_ACCOMMODATIONS') {
        return Promise.resolve({ status: 200 });
      }
      return Promise.resolve({ status: 403 });
    });

    // Mock pour l'appel accommodation
    (mockAxios.get as jest.Mock).mockImplementation((url: string, config?: any) => {
      if (url.includes('/read') && config?.params?.userId === '123') {
        return Promise.resolve({
          data: [{ ACCN_ID: 1, ACCC_NAME: 'Appartement Test' }]
        });
      }
      return Promise.resolve({ data: [] });
    });
  });

  it('should fetch accommodations for a given userId', async () => {
    const res = await request(app)
      .get('/accommodations')
      .query({ userId: '123' })
      .set('Authorization', 'Bearer valid_token'); // N’oublie pas ce header !

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      { ACCN_ID: 1, ACCC_NAME: 'Appartement Test' }
    ]);
  });

  it('should return 401 if no token provided', async () => {
    const res = await request(app).get('/accommodations').query({ userId: '123' });
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'No token provided' });
  });

  it('should return 403 if access denied', async () => {
    // On simule l'accès refusé
    (mockAxios.post as jest.Mock).mockResolvedValueOnce({ status: 403 });
    const res = await request(app)
      .get('/accommodations')
      .query({ userId: '123' })
      .set('Authorization', 'Bearer invalid_token');
    expect(res.status).toBe(403);
  });
});
