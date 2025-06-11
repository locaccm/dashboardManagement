// Set environment variables for message API and auth service
process.env.MESSAGE_API = 'http://fake/messages';
process.env.AUTH_SERVICE_URL = 'http://fake-auth';

import { getMessages, sendMessage } from '../controllers/messageController';
import mockAxios from 'axios';
import { Request, Response } from 'express';

jest.mock('axios');

describe('Message Controller with access control', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Reset mocks before each test
  });

  it('should get messages between users with valid token and access', async () => {
    // Mock request and response
    const req = {
      headers: { authorization: 'Bearer valid_token' },
      query: { from: '1', to: '2' },
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    // Mock access control
    (mockAxios.post as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/access/check')) {
        return Promise.resolve({ status: 200 }); // Access granted
      }
    });

    // Mock message retrieval
    (mockAxios.get as jest.Mock).mockResolvedValue({
      data: [{ MESN_ID: 1, MESC_CONTENT: 'Hello' }],
    });

    // Call controller
    await getMessages(req, res);

    // Verify access check
    expect(mockAxios.post).toHaveBeenCalledWith('http://fake-auth/access/check', {
      token: 'valid_token',
      rightName: 'VIEW_MESSAGES',
    });

    // Verify axios GET call
    expect(mockAxios.get).toHaveBeenCalledWith('http://fake/messages', {
      params: { from: '1', to: '2' },
    });

    // Verify response
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([{ MESN_ID: 1, MESC_CONTENT: 'Hello' }]);
  });

  it('should send message with valid token and access', async () => {
    // Mock request and response
    const req = {
      headers: { authorization: 'Bearer valid_token' },
      body: { sender: 1, receiver: 2, content: 'Hello there!' },
    } as unknown as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    // Mock both access check and message post
    (mockAxios.post as jest.Mock).mockImplementation((url: string, data: any) => {
      if (url.includes('/access/check')) {
        return Promise.resolve({ status: 200 }); // Access granted
      }
      if (url === 'http://fake/messages') {
        return Promise.resolve({
          data: { MESN_ID: 2, MESC_CONTENT: data.content },
        }); // Message sent
      }
    });

    // Call controller
    await sendMessage(req, res);

    // Verify access check
    expect(mockAxios.post).toHaveBeenCalledWith('http://fake-auth/access/check', {
      token: 'valid_token',
      rightName: 'SEND_MESSAGE',
    });

    // Verify axios POST to send message
    expect(mockAxios.post).toHaveBeenCalledWith('http://fake/messages', {
      sender: 1,
      receiver: 2,
      content: 'Hello there!',
    });

    // Verify response
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ MESN_ID: 2, MESC_CONTENT: 'Hello there!' });
  });
});
